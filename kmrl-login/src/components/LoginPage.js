import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import kmrlLogo from "../assets/kmrl-logo.jpeg";

const translations = {
  en: {
    supervisorLogin: "Supervisor Login",
    usernameLabel: "Username / Employee ID",
    usernamePlaceholder: "Enter your ID",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    loginButton: "Login",
    forgotPasswordLink: "Forgot Password?",
    footer: "© Kochi Metro Rail Limited",
    toggleButton: "മലയാളം",
    noAccount: "Don’t have an account?",
    signup: "Sign Up",
  },
  ml: {
    supervisorLogin: "സൂപ്പർവൈസർ ലോഗിൻ",
    usernameLabel: "ഉപയോക്തൃനാമം / എംപ്ലോയീ ഐഡി",
    usernamePlaceholder: "നിങ്ങളുടെ ഐഡി നൽകുക",
    passwordLabel: "പാസ്വേഡ്",
    passwordPlaceholder: "നിങ്ങളുടെ പാസ്വേഡ് നൽകുക",
    loginButton: "ലോഗിൻ ചെയ്യുക",
    forgotPasswordLink: "പാസ്വേഡ് മറന്നോ?",
    footer: "© കൊച്ചി മെട്രോ റെയിൽ ലിമിറ്റഡ്",
    toggleButton: "English",
    noAccount: "അക്കൗണ്ട് ഇല്ലേ?",
    signup: "സൈൻ അപ്പ്",
  },
};

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const T = translations[language];

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
    setLanguage(language === "en" ? "ml" : "en");
  };

  const cardClassName = `login-card ${language === "ml" ? "malayalam-active" : ""}`;

  return (
    <div className="app-background">
      <div className="language-toggle-fixed">
        <button onClick={toggleLanguage} className="language-toggle-btn">
          {T.toggleButton}
        </button>
      </div>

      <div className="login-container">
        <header>
          <img src={kmrlLogo} alt="KMRL Logo" className="logo" />
        </header>

        <div className={cardClassName}>
          <h2>{T.supervisorLogin}</h2>
          <form onSubmit={handleLogin}>
            <label>
              {T.usernameLabel}
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={T.usernamePlaceholder}
                required
              />
            </label>
            <label>
              {T.passwordLabel}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={T.passwordPlaceholder}
                required
              />
            </label>
            {error && <div style={{ color: "#c62828", fontSize: ".85rem" }}>{error}</div>}
            <button type="submit">{T.loginButton}</button>
          </form>

          <div className="forgot">
            <Link to="/forgot-password">{T.forgotPasswordLink}</Link>
          </div>

          <div className="register">
            {T.noAccount} <Link to="/signup">{T.signup}</Link>
          </div>
        </div>

        <footer>{T.footer}</footer>
      </div>
    </div>
  );
}
