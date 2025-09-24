import React, { useState } from "react";

const TrainModal = ({ train, onClose }) => {
  const [activeTab, setActiveTab] = useState("Maintainance");

  if (!train) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "Maintainance":
        return (
          <div className="fitness-metrics">
            <div className="fitness-row">
              <span className="fitness-label">Fitness RS Days</span>
              <span className="fitness-value">
                {train.indicators?.RS ?? "-"}d
              </span>
            </div>
            <div className="fitness-row">
              <span className="fitness-label">Fitness Sig Days</span>
              <span className="fitness-value">
                {train.indicators?.SIG ?? "-"}d
              </span>
            </div>
            <div className="fitness-row">
              <span className="fitness-label">Fitness Tel Days</span>
              <span className="fitness-value">
                {train.indicators?.TEL ?? "-"}d
              </span>
            </div>
          </div>
        );
      case "Job Card Status":
        return <p>Job Card Status data will be displayed here.</p>;
      case "Branding Hours":
        return <p>Branding Hours data will be displayed here.</p>;
      case "Mileage":
        return <p>Detailed Mileage data will be displayed here.</p>;
      case "Cleaning Slots":
        return <p>Cleaning Slots data will be displayed here.</p>;
      case "Stabling Score":
        return <p>Stabling Score data will be displayed here.</p>;
      case "Decision":
        return <p>Decision data will be displayed here.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
        <div className="modal-header-section">
          <div className="back-button-container">
            <button className="back-button" onClick={onClose}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="modal-title-container">
              <h3>{train.id} - Historical Data</h3>
              <p>Complete operational history and learning insights</p>
            </div>
          </div>
          {/* Status badge removed as requested */}
        </div>

        {/* Summary cards removed as per request */}

        <div className="tabs-navigation">
          {[
            "Maintainance",
            "Job Card Status",
            "Branding Hours",
            "Mileage",
            "Cleaning Slots",
            "Stabling Score",
            "Decision",
          ].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="modal-content-section">
          <h3>{activeTab}</h3>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TrainModal;