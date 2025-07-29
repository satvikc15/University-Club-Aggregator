import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import ClubAdminLogin from './pages/ClubAdminLogin';
import StudentLogin from './pages/StudentLogin';
import oucelogo from './oucelogo.png';
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
          <span className="header-title">University College of Engineering<br/>Osmania University</span>
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
  const { user, userType } = useContext(UserContext);

  return (
    <div className="feed-container">
      <div className="feed-placeholder">
        {/* Instagram-like event posts will go here */}
        <h2>Upcoming Events</h2>
        <p>Events feed coming soon...</p>
      </div>
      {userType === 'club' && (
        <button className="post-event-btn">
          Post New Event
        </button>
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

  return (
    <UserContext.Provider value={{ user, userType, updateUserState }}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login/club" element={<ClubAdminLogin onLogin={updateUserState} />} />
          <Route path="/login/student" element={<StudentLogin onLogin={updateUserState} />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
