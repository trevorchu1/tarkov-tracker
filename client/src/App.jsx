import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Login from './pages/Login.jsx';

export default function App(){
  return (
    <div style={{maxWidth: 900, margin: '0 auto', padding: 16}}>
      <nav style={{display:'flex', gap:12, marginBottom: 16}}>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/login">Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/search" element={<Search/>} />
        <Route path="/watchlist" element={<Watchlist/>} />
        <Route path="/login" element={<Login/>} />
      </Routes>
    </div>
  );
}
