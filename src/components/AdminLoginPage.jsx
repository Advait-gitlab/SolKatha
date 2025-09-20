import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username and password are required');
      return;
    }
    setError('');
    // Simulate admin login (replace with actual admin auth logic)
    console.log('Admin login data:', formData);
    navigate('/'); // Redirect to admin dashboard (to be created later)
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white">
      <h1 className="text-3xl mb-6">Admin Login</h1>
      <form onSubmit={handleSubmit} className="w-1/2 space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLoginPage;