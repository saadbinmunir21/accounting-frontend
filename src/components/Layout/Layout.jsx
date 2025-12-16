// src/components/Layout/Layout.jsx
import React from 'react';
import TopNavbar from '../TopNavbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <TopNavbar />

      <main className="pt-4">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;