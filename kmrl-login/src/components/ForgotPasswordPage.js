import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';
import kmrlLogo from '../assets/kmrl-logo.jpeg';

const ForgotPasswordPage = () => {
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!userId) return alert("Enter your User ID");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");

    try {
      const res = await fetch("http://localhost:5000/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordUpdated(true);
        alert("Password updated successfully!");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update password");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box forgot-password-centered">
        <img src={kmrlLogo} alt="KMRL Logo" className="logo" />
        <h2 className="title">FORGOT PASSWORD</h2>

        {!passwordUpdated && (
          <form onSubmit={handleChangePassword}>
            <div className="input-group">
              <label>User ID:</label>
              <input
                type="text"
                placeholder="Enter your User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="input-group">
              <label>New Password:</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn dark">Set New Password</button>
          </form>
        )}

        {passwordUpdated && (
          <div className="success-message" style={{ color: "#008080", fontWeight: "bold" }}>
            Password updated successfully.
          </div>
        )}

        <div className="back-to-login" style={{ marginTop: '1.2rem' }}>
          <Link to="/">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
