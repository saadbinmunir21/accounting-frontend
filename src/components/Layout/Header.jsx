// src/components/Layout/Header.jsx
import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-search">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <button className="icon-button">
          <Bell size={20} />
        </button>
        <button className="icon-button">
          <User size={20} />
        </button>
        <div className="user-info">
          <span className="user-name">Babar Azam</span>
        </div>
      </div>
    </header>
  );
};

export default Header;