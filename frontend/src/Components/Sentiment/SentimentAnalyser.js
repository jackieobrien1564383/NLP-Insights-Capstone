import React, { useEffect, useMemo, useState } from "react";
import SentimentResults from "./SentimentResults";

const API_URL = "http://localhost:8000/api/analyse-sentiment/";

export default function SentimentAnalyser({ uploadedText, uploadedPreview, corpusPreview, onBack }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, error: "" });

  const previews = useMemo(() => {
    const out = [];
    if (uploadedPreview) out.push({ label: "Your text (preview)", body: uploadedPreview });
    if (corpusPreview) out.push({ label: "Corpus preview", body: corpusPreview });
    return out;
  }, [uploadedPreview, corpusPreview]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState({ loading: true, error: "" });
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploaded_text: uploadedText || "" }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setState({ loading: false, error: e.message || "Request failed" });
        return;
      }
      if (!cancelled) setState({ loading: false, error: "" });
    })();
    return () => { cancelled = true; };
  }, [uploadedText]);

  return (
    <div className="analysis-container">
      {/* Header */}
      <div className="analysis-header">
        <button onClick={onBack} className="ttc-button ttc-button-sm">
          ← Back
        </button>
        <h1 className="analysis-title">Sentiment</h1>
      </div>

      {/* Loading */}
      {state.loading && (
        <div className="tcc-panel" style={{ textAlign: "center" }}>
          <div className="tcc-sub" style={{ margin: 0 }}>Analysing your text…</div>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="tcc-panel" style={{ borderColor: "#fecaca", background: "#fff1f2" }}>
          <div className="tcc-error">Error: {state.error}</div>
          <div className="tcc-sub" style={{ marginTop: 6 }}>
            Is the API available at <code>{API_URL}</code>?
          </div>
        </div>
      )}

      {/* Results */}
      {!state.loading && !state.error && (
        <>
          {/* Previews */}
          {previews.length > 0 && (
            <div className="tcc-grid tcc-grid-2-md" style={{ marginBottom: 16 }}>
              {previews.map((b, i) => (
                <div key={i} className="tcc-panel">
                  <div className="tcc-eyebrow">{b.label}</div>
                  <pre className="tcc-pre">{b.body}</pre>
                </div>
              ))}
            </div>
          )}

          <SentimentResults data={data} />
        </>
      )}
    </div>
  );
}
