import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Traders from './pages/Traders.jsx';
import Login from './pages/Login.jsx';
import './styles/Navbar.css';

export default function App(){
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => window.removeEventListener('storage', checkAuth);
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="navbar-title">Tarkov Tracker</span>
          </div>
          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/search" className={`navbar-link ${isActive('/search') ? 'active' : ''}`}>
              Search
            </Link>
            <Link to="/watchlist" className={`navbar-link ${isActive('/watchlist') ? 'active' : ''}`}>
              Watchlist
            </Link>
            <Link to="/traders" className={`navbar-link ${isActive('/traders') ? 'active' : ''}`}>
              Traders
            </Link>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="navbar-link navbar-login navbar-logout">
                Logout
              </button>
            ) : (
              <Link to="/login" className={`navbar-link navbar-login ${isActive('/login') ? 'active' : ''}`}>
                Login/Register
              </Link>
            )}
          </div>
        </div>
      </nav>
      <div style={{maxWidth: 1200, margin: '0 auto', padding: '1rem'}}>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/watchlist" element={<Watchlist/>} />
          <Route path="/traders" element={<Traders/>} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </div>
    </div>
  );
}
