import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function ClubAdminLogin({ onLogin }) {
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    clubName: '', 
    email: '' 
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
      const response = await fetch('http://localhost:5000/api/club/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.username,
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
    
    try {
      const response = await fetch('http://localhost:5000/api/club/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      alert('Registration successful! Please login.');
      setShowRegister(false);
      setForm({ username: '', password: '', clubName: '', email: '' });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Club Admin {showRegister ? 'Register' : 'Login'}</h2>
        {error && <div className="login-error">{error}</div>}
        {!showRegister ? (
          <form onSubmit={handleLogin}>
            <input 
              name="username" 
              type="text" 
              placeholder="Username" 
              value={form.username} 
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
              name="username" 
              type="text" 
              placeholder="Username" 
              value={form.username} 
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
            <input 
              name="clubName" 
              type="text" 
              placeholder="Club Name" 
              value={form.clubName} 
              onChange={handleChange} 
              required 
            />
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              value={form.email} 
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
            <span>New club? <button onClick={() => setShowRegister(true)}>Register</button></span>
          ) : (
            <span>Already registered? <button onClick={() => setShowRegister(false)}>Login</button></span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClubAdminLogin; 