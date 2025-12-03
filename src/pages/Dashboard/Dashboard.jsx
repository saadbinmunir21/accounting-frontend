// src/pages/Dashboard/Dashboard.jsx
import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Plan, prioritize, and accomplish your tasks with ease.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {/* Primary Card - Total Projects */}
        <div className="stat-card primary">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Projects</span>
            <TrendingUp size={20} />
          </div>
          <div className="stat-card-value">24</div>
          <div className="stat-card-footer">
            <span>↑ Increased from last month</span>
          </div>
        </div>

        {/* Ended Projects */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Ended Projects</span>
            <ArrowUpRight size={20} className="text-gray-400" />
          </div>
          <div className="stat-card-value">10</div>
          <div className="stat-card-footer">
            <span>↑ Increased from last month</span>
          </div>
        </div>

        {/* Running Projects */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Running Projects</span>
            <ArrowUpRight size={20} className="text-gray-400" />
          </div>
          <div className="stat-card-value">12</div>
          <div className="stat-card-footer">
            <span>↑ Increased from last month</span>
          </div>
        </div>

        {/* Pending Projects */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Project</span>
            <ArrowUpRight size={20} className="text-gray-400" />
          </div>
          <div className="stat-card-value">2</div>
          <div className="stat-card-footer">
            <span>On Process</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Project Analytics */}
        <div className="col-span-8">
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Project Analytics
            </h3>
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
              Chart will go here
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="col-span-4">
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Reminders
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Meeting with Arc Company</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Thu, 04 Apr 2pm • 04:00pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Collaboration */}
        <div className="col-span-6">
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Team Collaboration
            </h3>
            <p style={{ color: '#6b7280' }}>Team members will be listed here</p>
          </div>
        </div>

        {/* Project Progress */}
        <div className="col-span-6">
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Project Progress
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#10B981' }}>41%</div>
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>Project Ended</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;