import React, { useState, useEffect } from "react";
import "./FleetStatusDashboard1.css";

// --- Icon Components (using inline SVG for portability) ---
const CheckCircleIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const XCircleIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);
const AlertTriangleIcon = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// --- Helper Components for Table Cells ---

const FitnessIcons = ({ train }) => {
  const isRsOk = train.fitness_rs_days > 3;
  const isSigOk = train.fitness_sig_days > 3;
  const isTelOk = train.fitness_tel_days > 3;

  return (
    <div className="fitness-icons">
      {isRsOk ? (
        <CheckCircleIcon className="icon-green" />
      ) : (
        <XCircleIcon className="icon-red" />
      )}
      {isSigOk ? (
        <CheckCircleIcon className="icon-green" />
      ) : (
        <XCircleIcon className="icon-red" />
      )}
      {isTelOk ? (
        <CheckCircleIcon className="icon-green" />
      ) : (
        <XCircleIcon className="icon-red" />
      )}
    </div>
  );
};

const IssuesCell = ({ train }) => {
  let issueCount = 0;
  if (
    train.fitness_rs_days <= 3 ||
    train.fitness_sig_days <= 3 ||
    train.fitness_tel_days <= 3
  )
    issueCount++;
  if (train.job_card_status && train.job_card_status.toLowerCase() === "open")
    issueCount++;
  if (train.cleaning_slots_days >= 7) issueCount++;

  if (issueCount === 0) {
    return <span className="issues-none">✓</span>;
  }
  return <span className="issues-count-badge">{issueCount}</span>;
};

const TrainRow = ({ train }) => {
  const decisionMap = {
    revenue: "Revenue",
    maintenance: "Maintenance",
    standby: "Standby",
  };
  console.log(train);

  const displayDecision = decisionMap[train.decision?.toLowerCase()] || "N/A";

  return (
    <tr className="train-row">
      <td className="cell">{train.trainset_id}</td>
      <td className="cell">
        <span
          className={`decision-pill decision-${displayDecision.toLowerCase()}`}
        >
          {displayDecision}
        </span>
      </td>
      <td className="cell">
        <FitnessIcons train={train} />
      </td>
      <td className="cell job-card-cell">
        {train.job_card_status &&
        train.job_card_status.toLowerCase() === "closed" ? (
          <>
            <CheckCircleIcon className="icon-green" />
            <span>OK</span>
          </>
        ) : (
          <>
            <AlertTriangleIcon className="icon-yellow" />
            <span>Open</span>
          </>
        )}
      </td>
      <td className="cell">
        <div className="branding-hours">{train.branding_hours}h</div>
      </td>
      <td className="cell">{train.mileage_km} km</td>
      <td className="cell cleaning-cell">
        {train.cleaning_slots_days < 7 ? (
          <>
            <CheckCircleIcon className="icon-green" />
            <span>OK</span>
          </>
        ) : (
          <>
            <AlertTriangleIcon className="icon-yellow" />
            <span>Due</span>
          </>
        )}
      </td>
      <td className="cell">
        <div className="stabling-bay">S{train.stabling_s}</div>
        <div className="stabling-time">15min</div>
      </td>
      <td className="cell issues-cell">
        <IssuesCell train={train} />
      </td>
    </tr>
  );
};

// --- The Main App Component (Converted to Functional Component) ---
export default function FleetStatusDashboard() {
  const [fleetData, setFleetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFleetData = () => {
      setLoading(true);
      fetch("http://localhost:5000/trains")
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok. Is the backend server running?"
            );
          }
          return response.json();
        })
        .then((data) => {
          setFleetData(data);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching fleet data:", err);
          setError(
            "Failed to load data. Please make sure the backend server is running."
          );
          setFleetData([]);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchFleetData();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Fleet Status Table - All 25 Trainsets</h1>
        <p>
          Comprehensive view of all six critical variables for nightly induction
          planning
        </p>
      </header>
      <main className="table-container">
        <div className="table-wrapper">
          <table className="fleet-table">
            <thead>
              <tr>
                {[
                  "Train ID",
                  "Decision",
                  "Fitness (R/S/T)",
                  "Job Card",
                  "Branding",
                  "Mileage",
                  "Cleaning",
                  "Stabling",
                  "Issues",
                ].map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="message-cell">
                    Loading Fleet Data from Database...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="9" className="message-cell error-cell">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && fleetData.length === 0 && (
                <tr>
                  <td colSpan="9" className="message-cell">
                    No fleet data available.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                fleetData.map((train) => (
                  <TrainRow key={train.train_id_pk} train={train} />
                ))}
            </tbody>
          </table>
        </div>
        <footer className="dashboard-footer">
          <span>
            <span className="footer-label">Fitness:</span> R=Rolling Stock,
            S=Signalling, T=Telecom
          </span>
          <span>
            <span className="footer-label">Decision:</span> Algorithm
            recommendation for 21:00-23:00 window
          </span>
          <span>
            <span className="footer-label">Mileage:</span> Variance from fleet
            average for component balancing
          </span>
          <span>
            <span className="footer-label">Issues:</span> Number of constraint
            violations
          </span>
        </footer>
      </main>
    </div>
  );
}
