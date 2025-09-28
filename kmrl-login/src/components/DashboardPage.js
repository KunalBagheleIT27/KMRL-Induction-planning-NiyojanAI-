import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardPage.css";
import metroLogo from "../assets/kmrl-logo.jpeg";

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // --- User Badge State & Logic ---
  const deriveUser = () =>
    (typeof window !== "undefined" &&
      (localStorage.getItem("userId") ||
        localStorage.getItem("user") ||
        "User")) ||
    "User";
  const [userId, setUserId] = useState(deriveUser());
  const [badgeOpen, setBadgeOpen] = useState(false);
  const role = "Supervisor";

  const handleStorage = useCallback(
    (e) => {
      if (!e || ["userId", "user"].includes(e.key)) {
        setUserId(deriveUser());
      }
    },
    [deriveUser]
  );

  useEffect(() => {
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [handleStorage]);

  const initials = (userId || "U")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    } catch (_) {}
    navigate("/login");
  };

  // --- Fleet Data State ---
  const [fleetData, setFleetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch fleet stats from backend
  useEffect(() => {
    const fetchFleetData = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/trains");
        if (!res.ok) throw new Error("Backend fetch failed");
        const data = await res.json();
        setFleetData(data);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching fleet data:", err);
        setError("Failed to load fleet stats.");
        setFleetData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFleetData();
  }, []);

  // --- Compute stats dynamically ---
  const totalFleet = fleetData.length;
  const revenueCount = fleetData.filter(
    (t) => t.decision?.toLowerCase() === "revenue"
  ).length;
  const maintenanceCount = fleetData.filter(
    (t) => t.decision?.toLowerCase() === "maintenance"
  ).length;
  const standbyCount = fleetData.filter(
    (t) => t.decision?.toLowerCase() === "standby"
  ).length;

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar" onMouseLeave={() => setBadgeOpen(false)}>
        {/* Sidebar */}
        <div className="sidebar-header">
          <img
            src={metroLogo}
            alt="Kochi Metro Logo"
            className="sidebar-logo"
          />
          <h2>Kochi Metro</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li
              className={location.pathname === "/dashboard" ? "active" : ""}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </li>
            <li
              className={location.pathname === "/generate-plan" ? "active" : ""}
              onClick={() => navigate("/generate-plan")}
            >
              Generate Plan
            </li>
            <li
              className={location.pathname === "/reports" ? "active" : ""}
              onClick={() => navigate("/reports")}
            >
              Analytics & Reports
            </li>
            <li
              className={location.pathname === "/history" ? "active" : ""}
              onClick={() => navigate("/history")}
            >
              History and Learning
            </li>
            <li
              className={location.pathname === "/settings" ? "active" : ""}
              onClick={() => navigate("/settings")}
            >
              Settings
            </li>
          </ul>
        </nav>

        {/* User Badge */}
        <div
          className={`user-badge enhanced ${badgeOpen ? "open" : ""}`}
          title="Account menu"
        >
          <button
            className="user-badge-trigger"
            onClick={() => setBadgeOpen((o) => !o)}
          >
            <div className="user-avatar initials">{initials}</div>
            <div className="user-meta">
              <span className="user-name">{userId}</span>
              <span className="user-role-tag">{role}</span>
            </div>
            <span className="user-caret">▾</span>
          </button>
          {badgeOpen && (
            <div className="user-dropdown" role="menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  setBadgeOpen(false);
                  navigate("/settings");
                }}
              >
                Profile / Settings
              </button>
              <button className="dropdown-item danger" onClick={logout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="page-header">
          <h1>{t('dashboard.welcomeBack', 'Welcome back, Supervisor')}</h1>
          <p>{t('dashboard.sub', 'Monitor and manage your metro fleet operations')}</p>
        </header>

        {/* Fleet Overview (Dynamic) */}
        <section className="fleet-overview-cards">
          {loading ? (
            <p>Loading fleet stats...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <>
                <div className="card total-fleet">
                  <h3>{t('dashboard.totalFleet','Total Fleet')}   🚆</h3>
                <span className="count">{totalFleet}</span>
                <span role="img" aria-label="Total Fleet">   
                  
                </span>
              </div>
              <div className="card ready-fleet">
                  <h3>{t('dashboard.readyForService','Ready for Service')}   ✔</h3>
                <span className="count green">
                  {revenueCount} / {totalFleet}
                </span>
                <span role="img" aria-label="Ready">
                  
                </span>
              </div>
              <div className="card maintenance-fleet">
                  <h3>{t('dashboard.needsMaintenance','Needs Maintenance')}</h3>
                <span className="count red">
                  {maintenanceCount} / {totalFleet}
                </span>
                <span role="img" aria-label="Maintenance">
                  
                </span>
              </div>
              <div className="card standby-fleet">
                  <h3>{t('dashboard.onStandby','On Standby')}</h3>
                <span className="count orange">
                  {standbyCount} / {totalFleet}
                </span>
                <span role="img" aria-label="Standby">
                  
                </span>
              </div>
            </>
          )}
        </section>

        {/* Alerts & Notifications (kept static for now) */}
        {/* Alerts & Notifications */}
        <section className="alerts-section">
          <h2>{t('alerts.title','Alerts & Notifications')}</h2>
          <div className="alerts-grid">
            {[
              {
                id: 1,
                icon: "⚠",
                title: "Fitness Certificate Expiring",
                message: "KM-003 certificate expires in 3 days",
                time: "2 hours ago",
                severity: "Warning",
              },
              {
                id: 2,
                icon: "🛠",
                title: "Open Job Card",
                message: "Brake inspection pending for KM-007",
                time: "4 hours ago",
                severity: "Critical",
              },
              {
                id: 3,
                icon: "⏱",
                title: "Missed Cleaning Slot",
                message: "Bay 2 cleaning delayed by 30 minutes",
                time: "6 hours ago",
                severity: "Warning",
              },
            ].map((alert) => (
              <div
                key={alert.id}
                className={`alert-card sev-${alert.severity.toLowerCase()}`}
              >
                <div className="alert-icon" aria-hidden="true">
                  {alert.icon}
                </div>
                <div className="alert-body">
                  <div className="alert-headline-row">
                    <h3 className="alert-title">{alert.title}</h3>
                    <span className="severity-badge">{alert.severity}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  <time className="alert-time" dateTime={alert.time}>
                    {alert.time}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Operational Parameters */}
        <section className="parameters-dashboard">
          <h2 className="parameters-heading">{t('parameters.heading','Key Operational Parameters')}</h2>
          <div className="parameters-cards-grid">
            <div className="param-card">
              <div className="param-card-header">
                <span
                  className="param-icon"
                  role="img"
                  aria-label="Fitness Certificates"
                >
                  ⏱
                </span>
                  <h3>{t('parameters.fitness','Fitness Certificate Status')}</h3>
              </div>
              <p className="param-sub">Parameters tracked:</p>
              <ul>
                <li>RS (Rolling Stock) Certificate</li>
                <li>SIG (Signaling) Certificate</li>
                <li>TEL (Telecommunication) Certificate</li>
              </ul>
            </div>
            <div className="param-card">
              <div className="param-card-header">
                <span
                  className="param-icon"
                  role="img"
                  aria-label="Job Card Status"
                >
                  🛠
                </span>
                <h3>{t('parameters.jobcard','Job-Card Status')}</h3>
              </div>
              <p className="param-sub">Parameters tracked:</p>
              <ul>
                <li>Open Work Orders (from Maximo)</li>
                <li>Closed Work Orders</li>
              </ul>
            </div>
            <div className="param-card">
              <div className="param-card-header">
                <span
                  className="param-icon"
                  role="img"
                  aria-label="Branding Priorities"
                >
                  ⭐
                </span>
                <h3>{t('parameters.branding','Branding Priorities')}</h3>
              </div>
              <p className="param-sub">Parameters tracked:</p>
              <ul>
                <li>Branding Exposure Hours Achieved</li>
                <li>Target Hours (Monthly)</li>
                <li>Revenue Service Priority</li>
              </ul>
            </div>
            <div className="param-card">
              <div className="param-card-header">
                <span
                  className="param-icon"
                  role="img"
                  aria-label="Mileage Balancing"
                >
                  📊
                </span>
                <h3>{t('parameters.mileage','Mileage Balancing')}</h3>
              </div>
              <p className="param-sub">Parameters tracked:</p>
              <ul>
                <li>Current Mileage per Train</li>
                <li>Mileage Distribution Analysis</li>
              </ul>
            </div>
            <div className="param-card">
              <div className="param-card-header">
                <span
                  className="param-icon"
                  role="img"
                  aria-label="Cleaning Slots"
                >
                  💧
                </span>
                <h3>{t('parameters.cleaning','Cleaning & Detailing Slots')}</h3>
              </div>
              <p className="param-sub">Parameters tracked:</p>
              <ul>
                <li>Available vs Used Slots</li>
                <li>Train-wise Cleaning Status</li>
              </ul>
            </div>
            <div className="param-card">
              <div className="param-card-header">
                <span
                  className="param-icon"
                  role="img"
                  aria-label="Stabling Geometry"
                >
                  🗂
                </span>
                <h3>{t('parameters.stabling','Stabling Geometry')}</h3>
              </div>
              <p className="param-sub">Parameters tracked:</p>
              <ul>
                <li>Depot Bay Arrangement</li>
                <li>Stabling Score (0-1 scale)</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
