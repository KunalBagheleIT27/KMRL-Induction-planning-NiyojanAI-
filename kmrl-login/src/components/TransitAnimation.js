import React, { useEffect } from 'react';
import './TransitAnimation.css';

export default function TransitAnimation({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => {
      if (onDone) onDone();
    }, 1000); // 1 second
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="transit-overlay">
      <div className="train-wrap">
        <div className="train">
          <div className="engine"></div>
          <div className="carriage c1"></div>
          <div className="carriage c2"></div>
          <div className="wheels">
            <div className="wheel"></div>
            <div className="wheel"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
