import React from "react";

const SensorimotorAnalyser = () => {
  return (
    <div className="analysis-container">
    {/* header row: back + title on the same line */}
    <div className="analysis-header">
      <button onClick={onBack} className="ttc-button ttc-button-sm">← Back</button>
      <h1 className="analysis-title">
          Sensorimotor Norms Analysis</h1>
        <p className="text-gray-600">
          Explore sensorimotor associations in your text using lexicon matches.
        </p>
      </div>
    </div>
  );
};

export default SensorimotorAnalyser;
