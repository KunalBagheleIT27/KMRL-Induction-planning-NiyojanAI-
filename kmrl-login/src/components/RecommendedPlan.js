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
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const lineHeight = 16;
  // contentWidth intentionally omitted (calculated if needed for future layout)

    // Helpers
    const drawHeader = (title) => {
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text("Kochi Metro Rail Limited", margin + 6, margin - 8);

      doc.setDrawColor(10, 50, 90);
      doc.setLineWidth(1.5);
      doc.line(margin, margin + 6, pageWidth - margin, margin + 6);

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(10, 50, 90);
      doc.text(title, pageWidth / 2, margin + 26, { align: "center" });

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(60);
      doc.text(`Date: ${currentDate}`, pageWidth - margin, margin + 26, {
        align: "right",
      });
    };

    const drawFooter = (pageNum, totalPages) => {
      const footerY = pageHeight - margin + 10;
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margin, footerY - 14, pageWidth - margin, footerY - 14);

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("Kochi Metro Rail Limited", margin + 6, footerY);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY, {
        align: "right",
      });
    };

    const statusColor = (status) => {
      switch ((status || "").toLowerCase()) {
        case "service":
          return [14, 150, 74]; // green
        case "standby":
          return [3, 115, 191]; // blue
        case "maintenance":
          return [220, 53, 69]; // red
        default:
          return [120, 120, 120];
      }
    };

    // Prepare flat list of trains grouped by category but in one list so pagination is simple
    const categories = [
      { key: "Service", label: "For Service" },
      { key: "Standby", label: "For Standby" },
      { key: "Maintenance", label: "For Maintenance" },
    ];

    const entries = [];
    categories.forEach((cat) => {
      const catTrains = trains.filter((t) => t.status === cat.key);
      if (catTrains.length) {
        entries.push({ type: "category", label: `${cat.label} (${catTrains.length})` });
        catTrains.forEach((t) => entries.push({ type: "train", train: t }));
        entries.push({ type: "spacer" });
      }
    });

    // Pagination pass: write pages incrementally
  let y = margin + 60;
  let pageNum = 1;
  const pages = []; // placeholder to count pages (not required by jsPDF)

    // Start first page
    doc.setLineWidth(1);
    doc.setDrawColor(50);
    doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin, "S");
    drawHeader("Recommended Train Plan");

    // Render entries
    const flushPage = () => {
      pages.push(true);
      // Footer will be drawn after page count is known; for now draw page number placeholder
      doc.setFontSize(9);
      drawFooter(pageNum, "");
    };

    const addNewPage = () => {
      flushPage();
      doc.addPage();
      pageNum += 1;
      y = margin + 60;
      doc.setDrawColor(50);
      doc.rect(margin / 2, margin / 2, pageWidth - margin, pageHeight - margin, "S");
      drawHeader("Recommended Train Plan");
    };

    entries.forEach((entry) => {
      if (entry.type === "category") {
        // category header
        if (y + lineHeight * 2 > pageHeight - margin - 30) addNewPage();
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.setTextColor(20);
        doc.text(entry.label, margin + 6, y);
        y += lineHeight + 6;
      } else if (entry.type === "train") {
        const t = entry.train;
        const color = statusColor(t.status);

        if (y + lineHeight * 4 > pageHeight - margin - 30) addNewPage();

        // colored left bar
        doc.setFillColor(...color);
        doc.rect(margin + 2, y - 12, 6, lineHeight * 3 + 8, "F");

        // Train title row
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.setTextColor(30);
        doc.text(`${t.trainset_id}  —  ${t.status}`, margin + 16, y);
        y += lineHeight;

        // Details row 1
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.setTextColor(60);
        const leftColX = margin + 16;
        const rightColX = pageWidth / 2 + 20;

        doc.text(`Branding: ${t.branding_hours} hrs`, leftColX, y);
        doc.text(`Mileage: ${t.mileage_km} km`, rightColX, y);
        y += lineHeight;

        // Details row 2
        doc.text(`Decision: ${t.decision}`, leftColX, y);
        doc.text(`Date: ${t.date}`, rightColX, y);
        y += lineHeight + 8;
      } else if (entry.type === "spacer") {
        y += 8;
      }
    });

    // After writing content, draw footers with correct total page count
    const totalPages = pages.length || pageNum;
    // If there are more pages created after initial counting, ensure totalPages >= pageNum
    const finalTotal = Math.max(totalPages, pageNum);

    // Redraw footer on each page with correct numbering
    for (let i = 1; i <= finalTotal; i++) {
      doc.setPage(i);
      drawFooter(i, finalTotal);
    }

    // Save with safe filename
    const safeName = `KMRL_Recommended_Plan_${currentDate.replace(/[\s,]/g, "_")}.pdf`;
    doc.save(safeName);
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
