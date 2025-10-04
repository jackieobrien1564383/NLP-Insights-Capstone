import React, { useState } from "react";
import TextInputSection from "../TextInputSection";
import SensorimotorAnalyser from "./SensorimotorAnalyser";

// same tokenizer style across tools
const tokenize = (text) =>
  (text || "").toLowerCase().split(/[^a-zA-Z']+/).filter(Boolean);

const SensorimotorLanding = ({ onBack }) => {
  const [pastedText, setPastedText] = useState("");
  const [uploadedText, setUploadedText] = useState("");
  const [uploadedPreview, setUploadedPreview] = useState("");
  const [error, setError] = useState("");
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [pastedWordCount, setPastedWordCount] = useState(0);

  const handleTextPaste = (e) => {
    const text = e.target.value;
    setPastedText(text);
    setUploadedText(text);
    setUploadedPreview(text.split("\n").slice(0, 4).join("\n"));
    setPastedWordCount(tokenize(text).length);
  };

  const handleFilesUploaded = (combinedText) => {
    setUploadedText(combinedText);
    setUploadedPreview(combinedText.split("\n").slice(0, 4).join("\n"));
    setError("");
    setPastedWordCount(tokenize(combinedText).length);
  };

  const handleContinue = () => {
    if (!uploadedText.trim()) {
      setError("Please enter or upload some text before continuing.");
      return;
    }
    setAnalysisStarted(true);
  };

  if (analysisStarted) {
    return (
      <SensorimotorAnalyser
        words={tokenize(uploadedText)}      // privacy: send tokens only
        uploadedPreview={uploadedPreview}   // matches other tools’ UX
        onBack={() => setAnalysisStarted(false)}
      />
    );
  }

  return (
    <div className="analysis-container">
      {/* header row: back + title on one line */}
      <div className="analysis-header">
        <button type="button" onClick={onBack} className="ttc-button ttc-button-sm">
          ← Back
        </button>
        <h1 className="analysis-title">Sensorimotor Analysis</h1>
      </div>

      <p className="tcc-sub">See which senses and actions your text evokes.</p>

      <div className="analysis-main">
        <TextInputSection
          pastedText={pastedText}
          handleTextPaste={handleTextPaste}
          pastedWordCount={pastedWordCount}
          uploadedPreview={uploadedPreview}
          corpusPreview={""}           // not used here
          error={error}
          onFilesUploaded={handleFilesUploaded}
        />
      </div>

      <div className="analysis-actions">
        <button onClick={handleContinue} className="ttc-button ttc-button-lg">
          Continue to Analysis →
        </button>
      </div>
    </div>
  );
};

export default SensorimotorLanding;
