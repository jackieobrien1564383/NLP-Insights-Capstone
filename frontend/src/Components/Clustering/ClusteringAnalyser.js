import React from "react";

const ClusteringAnalyser = () => {
  return (
    <div className="analysis-container">
      {/* header row: back + title on the same line */}
      <div className="analysis-header">
        <button onClick={onBack} className="ttc-button ttc-button-sm">← Back</button>
        <h1 className="analysis-title">Clustering Analysis</h1>
      </div>
        <p className="text-gray-600">
          Discover semantic clusters and topics in your text.
        </p>
      </div>
    </div>
  );
};

export default ClusteringAnalyser;
