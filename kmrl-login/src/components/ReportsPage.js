import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ComposedChart,
} from "recharts";
import "./ReportsPage.css";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error loading reports:", err));
  }, []);

  if (!data) return <p>Loading reports...</p>;

  const { trends, fleetStatus, monthlyMaintenance, slaCompliance, mtbf } = data;
  const PIE_COLORS = fleetStatus.map((d) => d.color);

  return (
    <div className="reports-page-wrapper">
      <header className="reports-header">
        <button className="back-link" onClick={() => navigate(-1)}>
          &larr;
        </button>
        <div>
          <h1>Analytics & Reports</h1>
          <p>Comprehensive insights into your metro fleet operations</p>
        </div>
        <button className="export-btn">Export Report</button>
      </header>

      <section className="panel key-trends">
        <h2 className="section-title">Key Trends</h2>
        <div className="trend-cards">
          {trends.map((t, i) => (
            <div key={i} className={`trend-card ${t.type}`}>
              {t.label}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="two-col">
          <div className="chart-box">
            <h3>Fleet Status Distribution</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={fleetStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {fleetStatus.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(v, name) => [v, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-box">
            <h3>Monthly Maintenance Costs (₹L)</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyMaintenance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RTooltip formatter={(v) => `₹${v}.0L`} />
                  <Bar dataKey="cost" fill="#074b85" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="two-col">
          <div className="chart-box">
            <h3>SLA Compliance (%)</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={slaCompliance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
                  <RTooltip />
                  <Line
                    type="monotone"
                    dataKey="sla"
                    stroke="#0a8f3f"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-box">
            <h3>Mean Time Between Failures (Hours)</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <ComposedChart data={mtbf}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="train"
                    angle={-20}
                    textAnchor="end"
                    height={50}
                    interval={0}
                  />
                  <YAxis />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="actual" fill="#017d86" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="baseline"
                    fill="#ff8a22"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
