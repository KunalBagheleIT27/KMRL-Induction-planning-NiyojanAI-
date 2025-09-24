import React from "react";

const TrainCard = ({ train, onClick }) => {
  const { id } = train;
  return (
    <div className="train-card simple" onClick={onClick}>
      <div className="train-header only-name">
        <h3>🚆 Train {id}</h3>
      </div>
    </div>
  );
};

export default TrainCard;