import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsPage.css'; // Use your custom CSS

export default function SettingsPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [maintenanceLimit, setMaintenanceLimit] = useState(5);
  const [certExpiryDays, setCertExpiryDays] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add validation if needed
    alert('Settings saved!');
  };

  const handleLogout = () => {
    // Clear any auth/session data and navigate to login
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (e) {
      // ignore
    }
    navigate('/login');
  };

  return (
    <div className="app-background">
      <div className="login-container" style={{ maxWidth: 520 }}>
        <h2 className="section-title">⚙️ Settings</h2>
        <form onSubmit={handleSubmit}>
          {/* 1. Profile & Preferences */}
          <div className="card settings-section">
            <div className="settings-header">
              <span role="img" aria-label="profile">👤</span> Profile & Preferences
            </div>
            <label>
              <span role="img" aria-label="key">🔑</span> Change Password
              <input type="password" value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Current password" />
              <input type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password" minLength={6} />
              <input type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password" minLength={6} />
            </label>
            <label>
              <span role="img" aria-label="globe">🌐</span> Language
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="settings-select">
                <option value="en">English</option>
                <option value="ml">Malayalam</option>
              </select>
            </label>
          </div>
          {/* 2. Dashboard Customization */}
          <div className="card settings-section">
            <div className="settings-header">
              <span role="img" aria-label="dashboard">📊</span> Dashboard Customization
            </div>
            <label className="toggle-label">
              <span role="img" aria-label="bell">🔔</span> Notifications
              <label className="switch">
                <input type="checkbox" checked={notificationsOn}
                  onChange={() => setNotificationsOn(!notificationsOn)} />
                <span className="slider"></span>
              </label>
            </label>
          </div>
          {/* 3. Metro Operations Preferences */}
          <div className="card settings-section">
            <div className="settings-header">
              <span role="img" aria-label="metro">🚈</span> Metro Operations Preferences
            </div>
            <label>
              <span role="img" aria-label="toolbox">🧰</span> Maintenance Warning Limit
              <input type="number"
                value={maintenanceLimit}
                onChange={e => setMaintenanceLimit(e.target.value)}
                min={1} max={25}
                className="settings-number-input"
              />
             <span className="settings-hint">fleet units</span>
            </label>
            <label>
              <span role="img" aria-label="calendar">📅</span> Certification Expiry Alert (Days before)
              <input type="number"
                value={certExpiryDays}
                onChange={e => setCertExpiryDays(e.target.value)}
                min={1} max={30}
                className="settings-number-input"
              />
              <span className="settings-hint">days</span>
            </label>
          </div>
          {/* 4. Help & Support */}
          <div className="card settings-section">
            <div className="settings-header">
              <span role="img" aria-label="support">🆘</span> Help & Support
            </div>
            <button className="btn contact-btn" type="button">
              <span role="img" aria-label="phone">📞</span> Contact Us
            </button>
          </div>
          {/* Save & Logout */}
          <button className="btn primary save-btn" type="submit">
            <span role="img" aria-label="floppy">💾</span> Save Settings
          </button>
          <button className="btn logout-btn" type="button" onClick={handleLogout}>
            <span role="img" aria-label="logout">🚪</span> Logout
          </button>
        </form>
      </div>
    </div>
  );
}
