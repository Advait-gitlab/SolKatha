// src/components/CommunityWorkspace.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Star, MessageCircle, Award, Users } from 'lucide-react';

const CommunityWorkspace = () => {
  const [user] = useAuthState(auth);
  const [selectedIssue, setSelectedIssue] = useState('Academic Pressure');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [userBadges, setUserBadges] = useState({});
  const [loading, setLoading] = useState(false);

  const issues = [
    'Academic Pressure',
    'Family Expectations',
    'Career Confusion',
    'Social Anxiety',
    'Financial Stress',
    'Relationship Issues',
    'Identity Crisis',
    'Mental Health',
    'Time Management',
    'Future Planning'
  ];

  const badges = [
    { name: 'Certified Listener', requirement: 3, icon: '🎧', description: 'Helped 3+ people' },
    { name: 'Wisdom Keeper', requirement: 5, icon: '📚', description: 'Shared 5+ helpful insights' },
    { name: 'Community Champion', requirement: 10, icon: '🏆', description: 'Top contributor' },
    { name: 'Empathy Expert', requirement: 4.5, icon: '💝', description: 'Average rating >4.5' }
  ];

  // Load posts for selected issue
  useEffect(() => {
    if (!selectedIssue) return;

    const postsRef = collection(db, 'workspaces', selectedIssue, 'posts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [selectedIssue]);

  // Load user badges
  useEffect(() => {
    if (!user) return;

    const loadUserBadges = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserBadges(userData.badges || {});
        }
      } catch (error) {
        console.error('Error loading user badges:', error);
      }
    };

    loadUserBadges();
  }, [user]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    setLoading(true);
    try {
      const postsRef = collection(db, 'workspaces', selectedIssue, 'posts');
      await addDoc(postsRef, {
        content: newPost,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous Helper',
        timestamp: new Date(),
        ratings: [],
        averageRating: 0,
        helpfulCount: 0
      });

      setNewPost('');
    } catch (error) {
      console.error('Error posting:', error);
    }
    setLoading(false);
  };

  const handleRatePost = async (postId, rating) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'workspaces', selectedIssue, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const postData = postDoc.data();
        const existingRatings = postData.ratings || [];
        
        // Check if user already rated
        const existingRatingIndex = existingRatings.findIndex(r => r.userId === user.uid);
        
        let newRatings;
        if (existingRatingIndex !== -1) {
          // Update existing rating
          newRatings = [...existingRatings];
          newRatings[existingRatingIndex] = { userId: user.uid, rating };
        } else {
          // Add new rating
          newRatings = [...existingRatings, { userId: user.uid, rating }];
        }

        // Calculate new average
        const averageRating = newRatings.reduce((sum, r) => sum + r.rating, 0) / newRatings.length;
        const helpfulCount = newRatings.filter(r => r.rating >= 4).length;

        await updateDoc(postRef, {
          ratings: newRatings,
          averageRating,
          helpfulCount
        });

        // Check for badge eligibility
        await checkBadgeEligibility(postData.userId);
      }
    } catch (error) {
      console.error('Error rating post:', error);
    }
  };

  const checkBadgeEligibility = async (postAuthorId) => {
    if (postAuthorId !== user.uid) return;

    try {
      // Count user's helpful posts across all workspaces
      let totalHelpfulPosts = 0;
      let totalRatings = [];

      for (const issue of issues) {
        const postsRef = collection(db, 'workspaces', issue, 'posts');
        const q = query(postsRef);
        
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          const post = doc.data();
          if (post.userId === user.uid) {
            totalHelpfulPosts += post.helpfulCount || 0;
            totalRatings.push(...(post.ratings || []));
          }
        });
      }

      const userRatings = totalRatings.filter(r => r.userId !== user.uid);
      const avgRating = userRatings.length > 0 
        ? userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length 
        : 0;

      const newBadges = { ...userBadges };
      
      // Check badge requirements
      if (totalHelpfulPosts >= 3 && !newBadges['Certified Listener']) {
        newBadges['Certified Listener'] = new Date();
      }
      if (totalHelpfulPosts >= 5 && !newBadges['Wisdom Keeper']) {
        newBadges['Wisdom Keeper'] = new Date();
      }
      if (totalHelpfulPosts >= 10 && !newBadges['Community Champion']) {
        newBadges['Community Champion'] = new Date();
      }
      if (avgRating >= 4.5 && userRatings.length >= 5 && !newBadges['Empathy Expert']) {
        newBadges['Empathy Expert'] = new Date();
      }

      // Update user badges in Firestore
      if (Object.keys(newBadges).length > Object.keys(userBadges).length) {
        await updateDoc(doc(db, 'users', user.uid), { badges: newBadges });
        setUserBadges(newBadges);
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };

  const renderStars = (rating, postId, interactive = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => handleRatePost(postId, star) : undefined}
          />
        ))}
        {rating > 0 && (
          <span className="text-sm text-gray-600 ml-2">
            ({rating.toFixed(1)})
          </span>
        )}
      </div>
    );
  };

  const getUserRating = (post) => {
    if (!user || !post.ratings) return 0;
    const userRating = post.ratings.find(r => r.userId === user.uid);
    return userRating ? userRating.rating : 0;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <Users className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Our Community</h2>
          <p className="text-gray-600 mb-4">Please log in to access community workspaces</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Community Workspaces</h1>
          <p className="text-gray-600">Share experiences, find support, help others grow</p>
        </div>

        {/* User Badges */}
        {Object.keys(userBadges).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Your Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.keys(userBadges).map(badgeName => {
                const badge = badges.find(b => b.name === badgeName);
                return badge ? (
                  <div key={badgeName} className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                    <span className="mr-2">{badge.icon}</span>
                    <span className="text-sm font-medium">{badge.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Issue Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Select Topic</h3>
              <div className="space-y-2">
                {issues.map(issue => (
                  <button
                    key={issue}
                    onClick={() => setSelectedIssue(issue)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedIssue === issue
                        ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Post Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Share in "{selectedIssue}" Workspace
              </h3>
              <form onSubmit={handlePostSubmit}>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your experience, ask for advice, or offer support to others..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="4"
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    Posts are anonymous but you can earn badges for helpful contributions
                  </p>
                  <button
                    type="submit"
                    disabled={loading || !newPost.trim()}
                    className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Posting...' : 'Share'}
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No posts yet in this workspace. Be the first to share!</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">
                          {post.userDisplayName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {post.timestamp?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      {post.averageRating > 0 && (
                        <div className="flex items-center space-x-2">
                          {renderStars(post.averageRating)}
                          <span className="text-sm text-gray-500">
                            ({post.ratings?.length || 0} ratings)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                    
                    {user.uid !== post.userId && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-2">Rate this post:</p>
                        {renderStars(getUserRating(post), post.id, true)}
                      </div>
                    )}
                    
                    {post.helpfulCount > 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        {post.helpfulCount} people found this helpful
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWorkspace;