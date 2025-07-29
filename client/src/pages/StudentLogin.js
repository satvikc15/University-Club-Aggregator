import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function StudentLogin({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    confirm: '', 
    name: '', 
    studentId: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update parent component state immediately
      if (onLogin) {
        onLogin(data.user);
      }
      
      alert('Login successful!');
      navigate('/'); // Redirect to home page
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/student/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          studentId: form.studentId
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      alert('Registration successful! Please login.');
      setShowRegister(false);
      setForm({ email: '', password: '', confirm: '', name: '', studentId: '' });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Student {showRegister ? 'Register' : 'Login'}</h2>
        {error && <div className="login-error">{error}</div>}
        {!showRegister ? (
          <form onSubmit={handleLogin}>
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password (min 6 chars)" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
            <input 
              name="confirm" 
              type="password" 
              placeholder="Confirm Password" 
              value={form.confirm} 
              onChange={handleChange} 
              required 
            />
            <input 
              name="name" 
              type="text" 
              placeholder="Full Name" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
            <input 
              name="studentId" 
              type="text" 
              placeholder="Student ID" 
              value={form.studentId} 
              onChange={handleChange} 
              required 
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
        <div className="login-toggle">
          {!showRegister ? (
            <span>New user? <button onClick={() => setShowRegister(true)}>Register</button></span>
          ) : (
            <span>Already registered? <button onClick={() => setShowRegister(false)}>Login</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentLogin; 