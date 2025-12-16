// src/components/Layout/Header.jsx
import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-[70px] bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-10 mx-6 mb-6 mt-6 rounded-2xl">
      {/* Search Bar */}
      <div className="relative w-[400px]">
        <Search 
          size={20} 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-full py-3 px-4 pl-12 border border-gray-200 rounded-[10px] text-sm outline-none transition-all duration-200 bg-gray-50
            focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Button */}
        <button className="w-10 h-10 border-none bg-gray-100 rounded-[10px] flex items-center justify-center cursor-pointer text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:text-gray-800">
          <Bell size={20} />
        </button>

        {/* User Button */}
        <button className="w-10 h-10 border-none bg-gray-100 rounded-[10px] flex items-center justify-center cursor-pointer text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:text-gray-800">
          <User size={20} />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <span className="text-sm font-medium text-gray-800">Babar Azam</span>
        </div>
      </div>
    </header>
  );
};

export default Header;