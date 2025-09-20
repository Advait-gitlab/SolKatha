// src/components/Navigation.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { MessageCircle, Users, BookOpen, LogOut, Home } from 'lucide-react';

const Navigation = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-gray-800">Krishna AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/chat" 
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat</span>
            </Link>
            
            <Link 
              to="/story" 
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Stories</span>
            </Link>
            
            <Link 
              to="/community" 
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Community</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hello, {user.displayName || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;