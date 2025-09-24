import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./RecommendedPlan.css";

// --- SVG Icons ---
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ExportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ViewDetailsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// --- Train Card ---
const TrainCard = ({ train }) => (
  <div className="train-card">
    <div className="train-header">
      <span className="train-id">{train.trainset_id}</span>
      <span className={`status-badge ${train.status.toLowerCase()}-status`}>
        {train.status}
      </span>
    </div>
    <div className="train-details">
      <div className="detail-row">
        <span className="detail-label">Mileage:</span>
        <span>{train.mileage_km} km</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Branding:</span>
        <span>{train.branding_hours} hrs</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Decision:</span>
        <span>{train.decision}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Date:</span>
        <span>{train.date}</span>
      </div>
    </div>
  </div>
);

// --- Category Section ---
const CategorySection = ({ title, trains, type }) => (
  <div className={`category-section ${type}-section`}>
    <div className="category-header">
      <h2 className="category-title">{title}</h2>
      <span className="category-count">{trains.length}</span>
    </div>
    <div className="train-list">
      {trains.map((train) => (
        <TrainCard key={train.trainset_id} train={train} />
      ))}
    </div>
  </div>
);

// --- Main Component ---
const RecommendedPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trains, setTrains] = useState([]);
  const [selectedTrainId, setSelectedTrainId] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        let allTrains = location.state?.plan || [];
        if (!allTrains.length) {
          const res = await fetch("http://localhost:5000/trains");
          allTrains = await res.json();
        }

        const latestDate = allTrains.reduce(
          (max, t) => (t.date > max ? t.date : max),
          allTrains[0].date
        );
        const latestTrains = allTrains
          .filter((t) => t.date === latestDate)
          .slice(0, 40);

        const mappedTrains = latestTrains.map((t) => ({
          ...t,
          status: mapDecisionToStatus(t.decision),
        }));

        setTrains(mappedTrains);
      } catch (err) {
        console.error("Failed to fetch trains:", err);
      }
    };
    fetchTrains();
  }, [location.state]);

  const mapDecisionToStatus = (decision) => {
    switch ((decision || "").trim().toLowerCase()) {
      case "revenue":
        return "Service";
      case "standby":
        return "Standby";
      case "ibl":
        return "Maintenance";
      default:
        return "Maintenance";
    }
  };

  const serviceTrains = trains.filter((t) => t.status === "Service");
  const standbyTrains = trains.filter((t) => t.status === "Standby");
  const maintenanceTrains = trains.filter((t) => t.status === "Maintenance");

  const recalculatePlan = () => {
    setShowSubmit(true);
  };

  const submitChanges = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/whatif/${selectedTrainId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();

      // alert(data.message);

      // refresh trains from backend
      const refreshed = await fetch("http://localhost:5000/trains").then((r) =>
        r.json()
      );
      const mappedTrains = refreshed.map((t) => ({
        ...t,
        status: mapDecisionToStatus(t.decision),
      }));
      setTrains(mappedTrains);

      setShowSubmit(false);
      setSelectedTrainId("");
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Failed to update plan");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16).setFont(undefined, "bold");
    doc.text("KOCHI METRO RAIL LIMITED", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(12).setFont(undefined, "normal");
    doc.text(`Date: ${currentDate}`, 20, 30);

    doc.setFontSize(14).setFont(undefined, "bold");
    doc.text("Recommended Train Plan", pageWidth / 2, 40, { align: "center" });

    let yPos = 60;
    ["Service", "Standby", "Maintenance"].forEach((category) => {
      const categoryTrains = trains.filter((t) => t.status === category);
      doc.setFontSize(12).setFont(undefined, "bold");
      doc.text(`${category} Trains (${categoryTrains.length})`, 20, yPos);
      yPos += 10;
      doc.setFont(undefined, "normal");
      categoryTrains.forEach((train) => {
        doc.text(
          `• ${train.trainset_id} - ${train.branding_hours} hrs branding - ${train.mileage_km} km`,
          30,
          yPos
        );
        doc.text(`  Decision: ${train.decision}`, 35, yPos + 5);
        yPos += 15;
      });
      yPos += 10;
    });

    doc.save(`KMRL_Recommended_Plan_${currentDate.replace(/[\s,]/g, "_")}.pdf`);
  };

  return (
    <div className="recommended-plan-container">
      <button onClick={() => navigate("/dashboard")} className="back-button">
        <BackArrowIcon /> Back to Dashboard
      </button>

      <div className="header-section">
        <div className="header-content">
          <div>
            <h1 className="recommended-plan-title">
              Recommended Plan for {currentDate}
            </h1>
            <p className="header-description">
              Plan generated from uploaded train data.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="view-details-button"
              onClick={() => navigate("/fleet-status")}
            >
              <ViewDetailsIcon /> View Detailed Plan
            </button>
            <button className="export-button" onClick={generatePDF}>
              <ExportIcon /> Export Plan
            </button>
          </div>
        </div>
      </div>

      <div className="categories-grid">
        <CategorySection
          title="For Service"
          trains={serviceTrains}
          type="service"
        />
        <CategorySection
          title="For Standby"
          trains={standbyTrains}
          type="standby"
        />
        <CategorySection
          title="For Maintenance"
          trains={maintenanceTrains}
          type="maintenance"
        />
      </div>

      {/* What-If Simulator */}
      <div className="simulator-section">
        <h3 className="simulator-header">What-If Simulator</h3>
        <div className="simulator-controls">
          <select
            className="simulator-select"
            value={selectedTrainId}
            onChange={(e) => setSelectedTrainId(e.target.value)}
            disabled={showSubmit}
          >
            <option value="">Select a train...</option>
            {serviceTrains.map((train) => (
              <option key={train.trainset_id} value={train.trainset_id}>
                {train.trainset_id} - {train.status}
              </option>
            ))}
          </select>

          {!showSubmit ? (
            <button
              className="recalculate-button"
              onClick={recalculatePlan}
              disabled={!selectedTrainId}
            >
              Recalculate Plan
            </button>
          ) : (
            <button className="submit-changes-button" onClick={submitChanges}>
              Submit Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendedPlan;
