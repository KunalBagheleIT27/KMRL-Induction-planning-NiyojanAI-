import { useState } from "react";
import { UploadIcon } from "./Icons";
import { useNavigate } from "react-router-dom";
import "./GeneratePlanFile.css";

export default function GeneratePlanFile() {
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle CSV upload as text
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setMessage("");
    setError("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result; // raw CSV text

      try {
        const response = await fetch("http://localhost:5000/upload-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csv: csvText }), // send as JSON
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        setMessage(data.message || "Upload successful");

        if (data.plan && data.plan.length) {
          // Navigate to ProgressPage with plan
          navigate("/progress", { state: { plan: data.plan } });
        }
      } catch (err) {
        setError("Upload failed: " + err.message);
      }
    };

    reader.readAsText(file); // read file content as text
  };

  // Fetch train data from backend and redirect
  const fetchTrains = async () => {
    try {
      const res = await fetch("http://localhost:5000/trains");
      const data = await res.json();
      console.log("Train data from DB:", data);

      alert(`Fetched ${data.length} trains. Check console for details.`);

      if (data && data.length) {
        navigate("/progress", { state: { plan: data } });
      } else {
        setError("No train data found.");
      }
    } catch (err) {
      console.error("Error fetching trains:", err);
      setError("Failed to fetch train data.");
    }
  };

  return (
    <div className="plan-generator-container">
      <div className="header-section">
        <h2 className="title">Upload Train Operations CSV</h2>
        <p className="subtitle">
          Upload a CSV file, and the backend will parse and save it into the
          database.
        </p>
      </div>

      <div className="file-upload-zone">
        <input
          type="file"
          id="file-upload"
          accept=".csv"
          onChange={handleFileUpload}
          className="file-input"
        />
        <label htmlFor="file-upload" className="file-label">
          <UploadIcon />
          <p className="file-instructions">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="file-type">CSV files only</p>
        </label>
      </div>

      {fileName && (
        <p className="file-name-display">
          Selected file: <span>{fileName}</span>
        </p>
      )}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <button onClick={fetchTrains} className="generate-btn">
        Fetch Train Data / Generate Plan
      </button>
    </div>
  );
}