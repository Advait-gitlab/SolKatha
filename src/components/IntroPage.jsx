import React from 'react';
import { Link } from 'react-router-dom';

const IntroPage = () => {
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