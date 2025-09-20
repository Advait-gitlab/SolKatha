import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithCredentials } from '../services/firebase';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username and password are required');
      return;
    }
    setError('');
    try {
      const user = await signInWithCredentials(formData.username, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error); // Log for debugging
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white">
      <h1 className="text-3xl mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="w-1/2 space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="p-2 border rounded-lg w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="p-2 border rounded-lg w-full"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
          Login
        </button>
        <Link to="/forgot-password">
          <p className="text-gold-500 hover:underline">Forgot Password?</p>
        </Link>
      </form>
    </div>
  );
};

export default LoginPage;