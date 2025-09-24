import React, { useState, useEffect } from "react";
import "./HistoryPage.css";
import TrainCard from "./TrainCard";
import TrainModal from "./TrainModal";

const HistoryPage = () => {
  const [trains, setTrains] = useState([]);
  const [filteredTrains, setFilteredTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch from backend
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/history");
        const data = await response.json();

        // Map DB fields → frontend structure
        const mappedTrains = data.map((t) => ({
          id: t.trainset_id, // keep same as old mock
          status: t.decision?.toLowerCase() || "standby",
          mileage: t.mileage_km?.toLocaleString() || "0",
          lastMaintenance: t.date || "2025-09-19",
          indicators: {
            RS: t.fitness_rs_days || 0,
            SIG: t.fitness_sig_days || 0,
            TEL: t.fitness_tel_days || 0,
          },
          // Static/fallbacks
          totalMileage: (t.mileage_km || 0).toLocaleString(),
          maintenanceRecords: 5, // static
          brandingCampaigns: 2, // static
          incidentReports: 1, // static
          maintenanceHistory: [
            {
              type: "Emergency",
              date: "2025-09-19",
              description: "Signal Equipment Check",
              items: ["Brake Pads"],
              cost: 9836,
              time: "48h",
            },
            {
              type: "Preventive",
              date: "2025-09-12",
              description: "Signal Equipment Check",
              items: ["Brake Pads", "Filters", "Belts"],
              cost: 43743,
              time: "48h",
            },
            {
              type: "Preventive",
              date: "2025-08-05",
              description: "Routine Inspection",
              items: ["Fluid Check", "Wheel Alignment"],
              cost: 12500,
              time: "24h",
            },
          ],
        }));

        // Sort trains by train number (ascending)
        const sortedTrains = mappedTrains.sort((a, b) => {
          // Extract numbers from train IDs (e.g., "KM-003" -> 3)
          const numA = parseInt(a.id.replace(/[^0-9]/g, ''));
          const numB = parseInt(b.id.replace(/[^0-9]/g, ''));
          return numA - numB;
        });
        
        setTrains(sortedTrains);
        setFilteredTrains(sortedTrains);
      } catch (err) {
        console.error("Error fetching trains:", err);
      }
    };

    fetchTrains();
  }, []);

  // Search filter
  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const results = trains.filter((train) =>
      train.id.toLowerCase().includes(searchTerm)
    );
    setFilteredTrains(results);
  };

  const handleCardClick = (trainId) => {
    const train = trains.find((t) => t.id === trainId);
    if (train) {
      setSelectedTrain(train);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrain(null);
  };

  return (
    <div className="container-no-sidebar">
      <main className="main-content-full">
        <div className="dashboard-section header-section">
          <h2>History & Learning Analytics</h2>
          <p>Review historical data and status for all trains.</p>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search trains..."
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="dashboard-section train-cards-dashboard-section">
          <section className="train-cards-container">
            {filteredTrains.length > 0 ? (
              filteredTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  onClick={() => handleCardClick(train.id)}
                />
              ))
            ) : (
              <p>No trains found.</p>
            )}
          </section>
        </div>

        {isModalOpen && selectedTrain && (
          <TrainModal train={selectedTrain} onClose={closeModal} />
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
