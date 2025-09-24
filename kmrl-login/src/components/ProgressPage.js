import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProgressPage.css";

const ProgressPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || { plan: [] };

  // Redirect after 3 seconds
  useEffect(() => {
    if (!plan || !plan.length) {
      // no plan provided — send user back to generate page
      navigate('/generate-plan');
      return;
    }

    const timer = setTimeout(() => {
      navigate("/recommended-plan", { state: { plan } });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate, plan]);

  return (
    <div className="progress-container">
      <div className="progress-card">
        <div className="loader"></div>
        <h2>Generating Plan...</h2>
        <p>
          Our AI is analyzing your data and creating optimized recommendations.
        </p>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>

        <span className="note">This may take a few moments...</span>
      </div>

      {/* Inline keyframes for animation */}
      <style>
        {`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          .progress-fill {
            animation: progress 3s linear forwards;
          }
        `}
      </style>
    </div>
  );
};

export default ProgressPage;