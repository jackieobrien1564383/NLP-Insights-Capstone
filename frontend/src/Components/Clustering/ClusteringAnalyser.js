import React from "react";

const ClusteringAnalyser = ({ onBack }) => {
  return (
    <div className="analysis-container">
      {/* header row: back + title on one line */}
      <div className="analysis-header">
        <<button type="button" onClick={onBack} className="ttc-button ttc-button-sm">
          ← Back
        </button>
        <h1 className="analysis-title">Clustering Analysis</h1>
      </div>

      {/* subtitle under the header */}
      <p className="tcc-sub">
        Discover semantic clusters and topics in your text.
      </p>

      {/* page content */}
      <div className="analysis-main">
        {/* TODO: clustering UI/results go here */}
      </div>
    </div>
  );
};

export default ClusteringAnalyser;
