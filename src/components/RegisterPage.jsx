import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpWithCredentials } from '../services/firebase';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    email: '',
    day: '',
    month: '',
    year: '',
    profession: '',
    medicalHistory: null,
    avatar: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'];

  const validateForm = () => {
    if (!formData.username.trim()) return 'Username is required';
    if (!/^\d{10}$/.test(formData.mobile)) return 'Mobile must be 10 digits';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Invalid email format';
    if (!formData.day || !formData.month || !formData.year) return 'Age is required';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.avatar) return 'Please select an avatar';
    if (!formData.medicalHistory) return 'Medical history PDF is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    try {
      const user = await signUpWithCredentials(formData.email, formData.password);
      // Simulate storing additional profile data (replace with Firestore later)
      console.log('User registered:', { ...formData, uid: user.uid });
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-teal-500 text-white">
      <h1 className="text-3xl mb-6">Create New Account</h1>
      <form onSubmit={handleSubmit} className="w-1/2 space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        <input
          type="text"
          placeholder="Mobile (10 digits)"
          value={formData.mobile}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        <div className="flex space-x-2">
          <select
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            className="p-2 border rounded-lg text-black" // Added text-black
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            className="p-2 border rounded-lg text-black" // Added text-black
          >
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="p-2 border rounded-lg text-black" // Added text-black
          >
            <option value="">Year</option>
            {Array.from({ length: 100 }, (_, i) => (
              <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Profession"
          value={formData.profession}
          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.files[0] })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        <select
          value={formData.avatar}
          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        >
          <option value="">Select Avatar</option>
          {avatars.map((avatar) => (
            <option key={avatar} value={avatar}>{avatar}</option>
          ))}
        </select>
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="p-2 border rounded-lg w-full text-black" // Added text-black
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;