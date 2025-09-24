import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import kmrlLogo from "../assets/kmrl-logo.jpeg";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1200);
      }
       else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server error, please try again later");
    }
  };

  return (
    <div className="app-background">
      <div className="login-container">
        <header>
          <img src={kmrlLogo} alt="KMRL Logo" className="logo" />
        </header>
        <div className="login-card">
          <h2>Create Account</h2>
          {!success && (
            <form onSubmit={handleSubmit}>
              <label>
                Full Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </label>
              <label>
                Employee ID / Username
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Choose a unique ID"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password"
                  required
                  minLength={6}
                />
              </label>
              <label>
                Confirm Password
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                />
              </label>
              {error && (
                <div
                  style={{
                    color: "#c62828",
                    fontSize: ".85rem",
                    marginTop: "-.5rem",
                  }}
                >
                  {error}
                </div>
              )}
              <button type="submit">Sign Up</button>
            </form>
          )}
          {success && (
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  color: "#008080",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                Account created! Redirecting to login...
              </div>
              <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
          )}
          <div className="forgot" style={{ marginTop: "1.2rem" }}>
            <span style={{ fontSize: ".95rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#009688" }}>
                Login
              </Link>
            </span>
          </div>
        </div>
        <footer>© Kochi Metro Rail Limited</footer>
      </div>
    </div>
  );
}
