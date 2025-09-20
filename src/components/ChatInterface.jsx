import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { generateKrishnaResponse, getSentimentScore } from '../services/geminiAPI';
import { auth, db } from '../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';

const ChatInterface = () => {
  const [user] = useAuthState(auth);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mentalScore, setMentalScore] = useState(50);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(loadedMessages);
      console.log('Messages loaded:', loadedMessages); // Debug log
    });
    return () => unsubscribe();
  }, [user]);

  const handleInput = async (e) => {
    if (e.key !== 'Enter' || !userInput.trim() || isProcessing || !user) return;
    setIsProcessing(true);

    try {
      await addDoc(collection(db, 'messages'), {
        role: 'user',
        content: userInput,
        userId: user.uid,
        timestamp: new Date(),
      });

      const { response, sentiment } = await generateKrishnaResponse(userInput, messages);
      console.log('Sentiment detected:', sentiment);
      await addDoc(collection(db, 'messages'), {
        role: 'krishna',
        content: response,
        userId: user.uid,
        timestamp: new Date(),
      });

      const sentimentScore = getSentimentScore(userInput);
      console.log('Current input sentiment score:', sentimentScore); // Debug log
      if (sentimentScore < 0) {
        await addDoc(collection(db, 'capsules'), {
          userId: user.uid,
          content: userInput,
          sentiment: sentimentScore,
          timestamp: new Date(),
          revealed: false,
        });
        setMentalScore(prev => Math.max(0, prev - 10));
        console.log('Redirecting to story with input:', userInput); // Debug log
        navigate('/story', { state: { input: userInput } }); // Redirect on negative sentiment
      } else if (sentimentScore > 0) {
        setMentalScore(prev => Math.min(100, prev + 10));
      }
    } catch (error) {
      console.error('Error handling input:', error);
      await addDoc(collection(db, 'messages'), {
        role: 'krishna',
        content: 'Krishna is here to guide you. Please try again.',
        userId: user.uid,
        timestamp: new Date(),
      });
    } finally {
      setIsProcessing(false);
      setUserInput('');
    }
  };

  const clearChat = async () => {
    if (isProcessing || !user) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      await Promise.all(snapshot.docs.map(async (d) => {
        await deleteDoc(doc(db, 'messages', d.id));
      }));
      setMessages([]);
      console.log('Chat cleared successfully');
    } catch (error) {
      console.error('Error clearing chat:', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const revealCapsules = async () => {
    if (mentalScore >= 60) {
      const q = query(collection(db, 'capsules'), where('userId', '==', user.uid), where('revealed', '==', false));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await updateDoc(doc(db, 'capsules', docSnap.id), { revealed: true });
        console.log('Revealed capsule:', docSnap.data().content);
      });
    }
  };

  useEffect(() => {
    revealCapsules();
  }, [mentalScore]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen text-white">Please log in to chat.</div>;
  }

  return (
    <>
      <Navigation />
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500">
        <div className="flex-1 w-3/4 overflow-y-auto p-4">
          {messages
            .filter((msg) => msg.userId === user.uid)
            .map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-4 rounded-lg max-w-xs ${
                    msg.role === 'user'
                      ? 'bg-teal-200 text-purple-900'
                      : 'bg-gold-200 text-purple-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
        </div>
        {isProcessing && (
          <div className="mt-4 text-gold-200">Krishna is contemplating...</div>
        )}
        <div className="mt-4 flex space-x-4">
          <input
            type="text"
            placeholder="What's on your mind?"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleInput}
            className="p-2 border rounded-lg w-1/2 text-center bg-white bg-opacity-80"
            disabled={isProcessing}
          />
          <button
            onClick={clearChat}
            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            disabled={isProcessing}
          >
            Clear Chat
          </button>
          <p className="text-white">Score: {mentalScore}</p>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;