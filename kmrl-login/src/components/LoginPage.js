import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import "./LoginPage.css";
import kmrlLogo from "../assets/kmrl-logo.jpeg";

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        navigate("/dashboard"); // redirect
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    }
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'ml' : 'en';
    i18n.changeLanguage(next);
  };

  const cardClassName = `login-card ${i18n.language === "ml" ? "malayalam-active" : ""}`;

  return (
    <div className="app-background">
      <div className="language-toggle-fixed">
        <button onClick={toggleLanguage} className="language-toggle-btn">
          {i18n.language === 'en' ? 'മലയാളം' : 'English'}
        </button>
      </div>

      <div className="login-container">
        <header>
          <img src={kmrlLogo} alt="KMRL Logo" className="logo" />
        </header>

        <div className={cardClassName}>
          <h2>{t('login.supervisorLogin', 'Supervisor Login')}</h2>
          <form onSubmit={handleLogin}>
            <label>
              {t('login.usernameLabel', 'Username / Employee ID')}
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={t('login.usernamePlaceholder', 'Enter your ID')}
                required
              />
            </label>
            <label>
              {t('login.passwordLabel', 'Password')}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                required
              />
            </label>
            {error && <div style={{ color: "#c62828", fontSize: ".85rem" }}>{error}</div>}
            <button type="submit">{t('login.loginButton','Login')}</button>
          </form>

          <div className="forgot">
            <Link to="/forgot-password">{t('login.forgotPasswordLink', 'Forgot Password?')}</Link>
          </div>

          <div className="register">
            {t('login.noAccount','Don’t have an account?')} <Link to="/signup">{t('login.signup','Sign Up')}</Link>
          </div>
        </div>

        <footer>{t('footer.copyright','© Kochi Metro Rail Limited')}</footer>
      </div>
    </div>
  );
}
