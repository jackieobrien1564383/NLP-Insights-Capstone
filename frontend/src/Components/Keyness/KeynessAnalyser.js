import React, { useState, useEffect } from "react";
import ResultsTable from "./ResultsTable";
import KeynessResultsGrid from "./KeynessResultsGrid";
import Charts from "./Charts";
import ResultsSummary from "./ResultsSummary";
import "./ProgressBar.css";

const ProgressBar = ({ loading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer;
    if (loading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((old) => (old < 90 ? old + Math.random() * 3 : old));
      }, 200);
    } else {
      setProgress(100);
      const reset = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(reset);
    }
    return () => clearInterval(timer);
  }, [loading]);

  return (
    <div className="progress-container">
      <div
        className="progress-fill"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="progress-text">{Math.floor(progress)}%</div>
    </div>
  );
};

const KeynessAnalyser = ({ uploadedText, uploadedPreview, corpusPreview, method, onBack }) => {
  const [comparisonResults, setComparisonResults] = useState([]);
  const [stats, setStats] = useState({ uploaded_total: 0, sample_total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("nltk"); 
  const [filterMode, setFilterMode] = useState("content"); // "content" = default (nouns, verbs, adjectives, adverbs)

  const performAnalysis = async (method) => {
  if (!uploadedText) return;
  setLoading(true);
  setError("");
  setAnalysisDone(false);
  setSelectedMethod(method);

  try {
    console.log("Perform analysis clicked. Method:", method);

    const response = await fetch("http://localhost:8000/api/analyse-keyness/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploaded_text: uploadedText, method: method.toLowerCase(), filter_mode: filterMode, }),
    });

    const data = await response.json();
    console.log("Received data:", data);
    if (response.ok) {
      setComparisonResults(data.results.results || data.results);
      setStats({
        uploadedTotal: data.uploaded_total || uploadedText.split(/\s+/).length,
        corpusTotal: data.corpus_total || 0
      });
      setAnalysisDone(true);
      setSelectedMethod(method);
    } else {
      setError(data.error || "Analysis failed");
    }
  } catch (err) {
    console.error("Analysis error:", err);
    setError("Analysis failed: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    
    <div className="tcc-content tcc-stack-lg">
    {/* Back Button */}
    <button
      onClick={onBack}
      className="ttc-button ttc-button-outline ttc-button-sm"
    >
      ← Back
    </button>

{/* Word Filtering Options */}
    <div className="tcc-stack-md" style={{ textAlign: "center" }}>
      <p className="tcc-sub" style={{ margin: 0 }}>
        Select an option for what words in your text you would like analysed:
      </p>

      <div className="tcc-radios">
        <label className="tcc-radio">
          <input
            type="radio"
            name="filterMode"
            value="content"
            checked={filterMode === "content"}
            onChange={(e) => setFilterMode(e.target.value)}
          />
          <span>Only content words (nouns, verbs, adjectives, adverbs)</span>
        </label>

        <label className="tcc-radio">
          <input
            type="radio"
            name="filterMode"
            value="all"
            checked={filterMode === "all"}
            onChange={(e) => setFilterMode(e.target.value)}
          />
          <span>All words</span>
        </label>
      </div>
    </div>

      {/* Analyse Button */}
      <div className="tcc-btnrow">
      <button
        onClick={() => performAnalysis("NLTK")}
        disabled={loading || !uploadedText}
        className="ttc-button ttc-button-lg"
      >
        Analyse with NLTK
      </button>

      <button
        onClick={() => performAnalysis("sklearn")}
        disabled={loading || !uploadedText}
        className="ttc-button ttc-button-lg"
      >
        Analyse with Scikit-Learn
      </button>

      <button
        onClick={() => performAnalysis("gensim")}
        disabled={loading || !uploadedText}
        className="ttc-button ttc-button-lg"
      >
        Analyse with Gensim
      </button>

      <button
        onClick={() => performAnalysis("spaCy")}
        disabled={loading || !uploadedText}
        className="ttc-button ttc-button-lg"
      >
        Analyse with spaCy
      </button>
    </div>

     {/* Progress */}
    {loading && (
      <div className="tcc-content" style={{ maxWidth: 640 }}>
        <ProgressBar loading={loading} />
      </div>
    )}

    {/* Error */}
    {error && <p className="tcc-error">{error}</p>}

      {/* Results */}
    {analysisDone && (
      <>
        <ResultsSummary
          stats={stats}
          selectedMethod={selectedMethod}
          comparisonResults={comparisonResults}
        />

    {/* Significant Keywords Grid */}
    <KeynessResultsGrid results={comparisonResults.slice(0, 20)} method={selectedMethod} />

    {/* Charts */}
    <Charts results={comparisonResults.results ?? comparisonResults} method={selectedMethod} />


    {/* Full Results Table */}
    <ResultsTable results={comparisonResults} method={selectedMethod} />
  </>
)}
    </div>
  );
};

export default KeynessAnalyser;
