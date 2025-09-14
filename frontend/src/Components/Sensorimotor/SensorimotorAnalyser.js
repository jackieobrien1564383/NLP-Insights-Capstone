import React from "react";

const SensorimotorAnalyser = () => {
  return (
    <div className="analysis-container">
      {/* header row: back + title on one line */}
      <div className="analysis-header">
        <button onClick={onBack} className="ttc-button ttc-button-sm">
          ← Back
        </button>
        <h1 className="analysis-title">Sensorimotor Norms Analysis</h1>
      </div>

      {/* subtitle under the header */}
      <p className="tcc-sub">
        Explore sensorimotor associations in your text using lexicon matches.
      </p>

      {/* main content goes here */}
      <div className="analysis-main">
        {/* TODO: inputs/results/components */}
      </div>
    </div>
  );
};

export default SensorimotorAnalyser;
