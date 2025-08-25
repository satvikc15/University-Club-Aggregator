import React, { useState } from 'react';
import axios from 'axios';
import { FaPlusCircle } from 'react-icons/fa';

const ClubAdminPostEvent = () => {
  const [poster, setPoster] = useState(null);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef();

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file && !/\.(jpg|jpeg|png)$/i.test(file.name)) {
      setError('Only .jpg, .jpeg, .png files are allowed!');
      setPoster(null);
      return;
    }
    setPoster(file);
    setError('');
  };

  const handlePosterIconClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!title || title.length < 3) {
      setError('Title is required and must be at least 3 characters.');
      return;
    }
    if (!category) {
      setError('Category is required.');
      return;
    }
    if (!description || description.split(/\s+/).length > 1000) {
      setError('Description is required and must be at most 1000 words.');
      return;
    }
    if (!dateTime) {
      setError('Date and time are required.');
      return;
    }
    // Date validation: must be after now
    const selectedDate = new Date(dateTime);
    const now = new Date();
    if (selectedDate <= now) {
      setError('Event date/time must be in the future.');
      return;
    }
    if (!location) {
      setError('Location is required.');
      return;
    }
    const formData = new FormData();
    if (poster) formData.append('poster', poster);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('dateTime', dateTime);
    formData.append('location', location);
    if (registrationLink) formData.append('registrationLink', registrationLink);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Event posted successfully!');
      setTitle('');
      setCategory('');
      setDescription('');
      setDateTime('');
      setLocation('');
      setRegistrationLink('');
      setPoster(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-event-container">
      <h2>Post a New Event</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="poster-upload-row">
          <div className="poster-label-row">
            <label style={{marginBottom: 0}}>Poster (jpg, jpeg, png, optional):</label>
            <span className="poster-plus-icon" onClick={handlePosterIconClick} title="Add poster">
              <FaPlusCircle size={28} />
            </span>
            {poster && <span className="poster-filename">{poster.name}</span>}
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handlePosterChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </div>
        <div className="form-row">
          <label>Title<span style={{color:'red'}}>*</span>:</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required minLength={3} />
        </div>
        <div className="form-row">
          <label>Category<span style={{color:'red'}}>*</span>:</label>
          <select value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select Category</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Competition">Competition</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Social">Social</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-row">
          <label>Date & Time<span style={{color:'red'}}>*</span>:</label>
          <input type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} required />
        </div>
        <div>
          <label>Description (max 1000 words):</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required maxLength={8000} />
        </div>
        <div>
          <label>Location:</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <div>
          <label>Registration Link (optional):</label>
          <input type="url" value={registrationLink} onChange={e => setRegistrationLink(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>{success}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Event'}</button>
      </form>
    </div>
  );
};

export default ClubAdminPostEvent; 