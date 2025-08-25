import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import './App.css';
import ClubAdminLogin from './pages/ClubAdminLogin';
import StudentLogin from './pages/StudentLogin';
import ClubAdminPostEvent from './pages/ClubAdminPostEvent';
import oucelogo from './oucelogo.png';
import axios from 'axios';
// Create a context to share user state between components
const UserContext = React.createContext();

function Header() {
  const navigate = useNavigate();
  const { user, userType, updateUserState } = useContext(UserContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUserState(null);
    alert('Logout successful!');
    navigate('/');
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <img src={oucelogo} alt="University Logo" className="header-logo" />
        <button className="header-title" onClick={() => navigate('/')}>
          <span className="header-title">University College of Engineering<br />Osmania University</span>
        </button>
      </div>
      <div className="header-right">
        {user ? (
          <div className="user-info">
            <span className="user-name">
              {userType === 'club' ? user.clubName : user.name}
            </span>
            <button className="header-btn logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <>
            <button className="header-btn" onClick={() => navigate('/login/club')}>Club Login</button>
            <button className="header-btn" onClick={() => navigate('/login/student')}>Student Login</button>
          </>
        )}
      </div>
    </header>
  );
}

function Feed() {
  const { userType } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        // Make sure the endpoint is correct and your backend is running
        const res = await axios.get('http://localhost:5000/api/events');
        setEvents(res.data.events || []);
      } catch (err) {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const toggleExpanded = (eventId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedPosts(newExpanded);
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return 'Date not specified';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="linkedin-feed">
      <div className="feed-header">
        <h2>Upcoming Events</h2>
      </div>

      {loading && (
        <div className="loading-container">
          <p>Loading events...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
        </div>
      )}

      <div className="posts-container">
        {events.length === 0 && !loading && (
          <div className="no-events">
            <p>No events found.</p>
          </div>
        )}

        {events.map(event => {
          const isExpanded = expandedPosts.has(event._id);
          const shortDescription = event.description?.slice(0, 100) || 'No description available';
          const hasLongDescription = event.description && event.description.length > 100;

          return (
            <div className="linkedin-post" key={event._id}>
              {/* Post Header */}
              <div className="post-header">
                <div className="club-info">
                  <div className="club-details">
                    <h4 className="club-name">{event.tags && event.tags.length > 0 ? event.tags[0] : 'Club'}</h4>
                    <p className="post-time">{new Date(event.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="post-content">
                <div className="post-text">
                  <h3
                    className="event-title clickable"
                    onClick={() => toggleExpanded(event._id)}
                  >
                    {event.title || 'Event Title'}
                  </h3>

                  <p className="event-description">
                    {isExpanded ? event.description : shortDescription}
                    {hasLongDescription && (
                      <span
                        className="expand-toggle"
                        onClick={() => toggleExpanded(event._id)}
                      >
                        {isExpanded ? ' ...show less' : ' ...see more'}
                      </span>
                    )}
                  </p>

                  {isExpanded && (
                    <div className="event-details">
                      <div className="detail-item">
                        <strong>📅 Date & Time:</strong>
                        <span>{formatDate(event.dateTime)}</span>
                      </div>
                      <div className="detail-item">
                        <strong>📍 Location:</strong>
                        <span>{event.venue || 'Location not specified'}</span>
                      </div>
                      {event.registrationLink && (
                        <div className="detail-item">
                          <strong>🔗 Registration:</strong>
                          <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                            Register Here
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Image */}
                {event.poster && (
                  <div className="post-image">
                    <img src={event.poster} alt="Event Poster" />
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="post-actions">
                <button className="action-btn">
                  👍 Like
                </button>
                <button className="action-btn">
                  💬 Comment
                </button>
                <button className="action-btn">
                  📤 Share
                </button>
                {event.registrationLink && (
                  <button
                    className="action-btn register-btn"
                    onClick={() => window.open(event.registrationLink, '_blank')}
                  >
                    📝 Register
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {userType === 'club' && (
        <div className="floating-action">
          <button className="post-event-btn" onClick={() => navigate('/clubadmin/post-event')}>
            + Post New Event
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      if (userData.clubName) {
        setUserType('club');
      } else if (userData.studentId) {
        setUserType('student');
      }
    }
  }, []);

  const updateUserState = (userData) => {
    setUser(userData);
    if (userData && userData.clubName) {
      setUserType('club');
    } else if (userData && userData.studentId) {
      setUserType('student');
    } else {
      setUserType(null);
    }
  };

  const isClubAdmin = localStorage.getItem('type') === 'club';

  return (
    <UserContext.Provider value={{ user, userType, updateUserState }}>
      <Router>
        <Header />
        {isClubAdmin && (
          <div style={{ margin: '20px' }}>
            <Link to="/clubadmin/post-event">
              <button>Post a New Event</button>
            </Link>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login/club" element={<ClubAdminLogin onLogin={updateUserState} />} />
          <Route path="/login/student" element={<StudentLogin onLogin={updateUserState} />} />
          <Route path="/clubadmin/post-event" element={<ClubAdminPostEvent />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
