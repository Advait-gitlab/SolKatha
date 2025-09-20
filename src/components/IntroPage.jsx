import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { MessageCircle, Users, BookOpen } from 'lucide-react';

const IntroPage = () => {
  const [user] = useAuthState(auth);

  // If user is logged in, show dashboard-style intro
  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white">
        <h1 className="text-4xl mb-6">Welcome back to Solkatha</h1>
        <p className="text-center max-w-md mb-8">
          Hello, {user.displayName || user.email}! Choose your path to wellness and self-discovery.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
          <Link to="/chat" className="transform hover:scale-105 transition-transform">
            <div className="bg-white bg-opacity-20 p-6 rounded-lg text-center backdrop-blur-sm">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-teal-300" />
              <h3 className="text-xl font-semibold mb-2">Chat with Krishna</h3>
              <p className="text-sm opacity-90">Get personalized guidance and wisdom from Krishna AI</p>
            </div>
          </Link>
          
          <Link to="/story" className="transform hover:scale-105 transition-transform">
            <div className="bg-white bg-opacity-20 p-6 rounded-lg text-center backdrop-blur-sm">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gold-300" />
              <h3 className="text-xl font-semibold mb-2">Wisdom Stories</h3>
              <p className="text-sm opacity-90">Discover personalized stories and guidance for your challenges</p>
            </div>
          </Link>
          
          <Link to="/community" className="transform hover:scale-105 transition-transform">
            <div className="bg-white bg-opacity-20 p-6 rounded-lg text-center backdrop-blur-sm">
              <Users className="w-12 h-12 mx-auto mb-4 text-orange-300" />
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-sm opacity-90">Connect with peers, share experiences, and support each other</p>
            </div>
          </Link>
        </div>
        
        <div className="mt-8">
          <Link to="/login">
            <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Sign Out
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Original intro page for non-authenticated users
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white">
      <h1 className="text-4xl mb-6">Welcome to Solkatha</h1>
      <p className="text-center max-w-md mb-8">
        Solkatha is your mental wellness companion, inspired by the wisdom of Krishna and Arjuna. Embark on a journey of emotional support and self-discovery with personalized guidance.
      </p>
      <div className="space-x-4">
        <Link to="/register">
          <button className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
            Create New Account
          </button>
        </Link>
        <Link to="/login">
          <button className="p-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600">
            Already a User
          </button>
        </Link>
        <Link to="/admin-login">
          <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Admin Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default IntroPage;