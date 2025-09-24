/* eslint-disable no-unused-vars, no-useless-computed-key */
import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import kmrlLogo from "../assets/kmrl-logo.jpeg";

// Updated to display: WELCOME TO नियोजनAI ! (with Devanagari segment kept as one grouped span)
export default function WelcomePage() {
  const navigate = useNavigate();
  let letterIndex = 0; // for stagger timing
  const baseDelay = 0.08;

  // Helper to render a string as animated letters
  const renderLetters = (str, prefix) =>
    Array.from(str).map((ch, i) => {
      if (ch === " ")
        return (
          <span key={`${prefix}-sp-${i}`} className="mega-letter spacer">
            &nbsp;
          </span>
        );
      const current = letterIndex++;
      return (
        <span
          key={`${prefix}-${i}`}
          className="mega-letter"
          style={{
            animationDelay: `${current * baseDelay}s`,
            "--hue": `${(current * 18) % 360}`,
          }}
        >
          {ch}
        </span>
      );
    });

  return (
    <div className="app-background welcome-dim">
      <div
        className="animated-hero dark-hero"
        role="main"
        aria-label="WELCOME TO नियोजनAI !"
      >
        <header className="animated-hero-header">
          <img src={kmrlLogo} alt="KMRL Logo" className="logo" />
        </header>
        <h1
          className="mega-title dark-letters"
          aria-label="WELCOME TO नियोजनAI !"
        >
          {/* WELCOME TO */}
          {renderLetters("WELCOME TO", "pre")}
          {/* space */}
          <span className="mega-letter spacer">&nbsp;</span>
          {/* नियोजन should render as one intact word (no splitting of combining marks) */}
          <span className="kochi-group">
            {(() => {
              const current = letterIndex++; // single animation slot for whole word
              return (
                <span
                  key="dev-word"
                  className="mega-letter dev-word"
                  style={{
                    animationDelay: `${current * baseDelay}s`,
                    "--hue": `${(current * 18) % 360}`,
                  }}
                >
                  नियोजन
                </span>
              );
            })()}
            {/* Keep AI letters individually animated for continuity */}
            {renderLetters("AI", "ai")}
          </span>
          <span className="mega-letter spacer">&nbsp;</span>
          {/* Exclamation mark */}
          {renderLetters("!", "bang")}
        </h1>
        <div className="hero-actions-bar dark-actions">
          <button
            className="dark-btn-primary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="dark-btn-secondary"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
        <footer className="hero-footer dark-footer">
          © Kochi Metro Rail Limited
        </footer>
      </div>
    </div>
  );
}