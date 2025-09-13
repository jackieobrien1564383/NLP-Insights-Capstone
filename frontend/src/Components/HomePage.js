import React from "react";

const HomePage = ({ onSelect }) => {
  return (
    <div className="app-hero">
      <div className="tcc-card">
        <h1 className="tcc-title">Welcome to TCC Writing Analysis</h1>
        <p className="tcc-sub">Select the type of analysis you would like to perform:</p>

        <select
          onChange={(e) => onSelect(e.target.value)}
          className="tcc-select"
          defaultValue=""
          aria-label="Select analysis type"
        >
          <option value="" disabled>
            What type of analysis would you like to do?
          </option>
          <option value="keyness">Keyness</option>
          <option value="sentiment">Sentiment</option>
          <option value="clustering">Clustering</option>
          <option value="sensorimotor">Sensorimotor Norms</option>
        </select>
      </div>
    </div>
  );
};

export default HomePage;

