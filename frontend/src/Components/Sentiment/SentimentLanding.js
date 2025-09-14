import React, { useState, useEffect } from "react";
import TextInputSection from "../TextInputSection";
import SentimentAnalyser from "./SentimentAnalyser";
// import "./SentimentLanding.css";

const SentimentLanding = ({ onBack }) => {
  // same state as ClusteringLanding...
  const [pastedText, setPastedText] = useState("");
  const [uploadedText, setUploadedText] = useState("");
  const [uploadedPreview, setUploadedPreview] = useState("");
  const [activeInput, setActiveInput] = useState("");
  const [error, setError] = useState("");
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [corpusPreview, setCorpusPreview] = useState("");
  const [pastedWordCount, setPastedWordCount] = useState(0);

  useEffect(() => {
    const fetchCorpusPreview = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/corpus-preview/");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCorpusPreview(data.preview.split("\n").slice(0, 4).join("\n"));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCorpusPreview();
  }, []);

  const handleTextPaste = (e) => {
    const text = e.target.value;
    setPastedText(text);
    setUploadedText(text);
    setUploadedPreview(text.split("\n").slice(0, 4).join("\n"));
    setActiveInput("text");

    const words = text.trim().split(/\s+/).filter(Boolean);
    setPastedWordCount(words.length);
  };

  const handleFilesUploaded = (combinedText, files) => {
    setUploadedText(combinedText);
    setUploadedPreview(combinedText.split("\n").slice(0, 4).join("\n"));
    setActiveInput("file");
    setError("");
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
      <SentimentAnalyser
        uploadedText={uploadedText}
        uploadedPreview={uploadedPreview}
        corpusPreview={corpusPreview}
        onBack={() => setAnalysisStarted(false)}
      />
    );
  }

  return (
  <div className="analysis-container">
    {/* header row: back + title on the same line */}
    <div className="analysis-header">
      <button onClick={onBack} className="ttc-button ttc-button-sm">← Back</button>
      <h1 className="analysis-title">Sentiment Analysis</h1>
    </div>

    {/* wrap main content so spacing rules can target it */}
    <div className="analysis-main">
        <TextInputSection
          pastedText={pastedText}
          handleTextPaste={handleTextPaste}
          pastedWordCount={pastedWordCount}
          uploadedPreview={uploadedPreview}
          corpusPreview={corpusPreview}
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

export default SentimentLanding;
