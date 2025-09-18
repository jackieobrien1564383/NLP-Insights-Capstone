import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

// Vercel → Settings → Environment Variables
const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://nlp-insights-capstone.onrender.com";

const SensorimotorAnalyser = ({ words, uploadedPreview, onBack }) => {
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [error, setError] = useState("");
  const [matchedCount, setMatchedCount] = useState(0);
  const [modalities, setModalities] = useState([]);
  const [profile, setProfile] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("loading");
      try {
        const res = await fetch(`${BACKEND_URL}/api/sm/profile/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ words }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setMatchedCount(data.matchedCount || 0);
          setModalities(data.modalities || []);
          setProfile(data.profile || []);
          setStatus("done");
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            "Analysis failed. Check backend URL/CORS. Backend should load sm_norms_min.json (via SM_JSON_URL or static file)."
          );
          setStatus("error");
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [words]);

  const chartData = modalities.map((m, i) => ({ modality: m, value: Number(profile[i] || 0) }));

  return (
    <div className="analysis-container">
      {/* header row: back + title on one line */}
      <div className="analysis-header">
        <button type="button" onClick={onBack} className="ttc-button ttc-button-sm">
          ← Back
        </button>
        <h1 className="analysis-title">Sensorimotor Analysis</h1>
      </div>

      <div className="analysis-main">
        {status === "loading" && <p>Crunching numbers…</p>}
        {status === "error" && <p className="error-text">{error}</p>}

        {status === "done" && (
          <>
            {uploadedPreview && <pre className="analysis-preview">{uploadedPreview}</pre>}

            <p className="tcc-sub">
              Matched <strong>{matchedCount}</strong> words. Higher values indicate stronger
              sensory/action associations in the Lancaster norms.
            </p>

            <div className="analysis-grid">
              <div className="analysis-panel">
                <h3>Bar chart</h3>
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="modality" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="analysis-panel">
                <h3>Radar chart</h3>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData} outerRadius="70%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="modality" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis />
                      <Radar name="Profile" dataKey="value" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <details className="analysis-note">
              <summary>Privacy & method</summary>
              <p>
                We send only your token list to the backend. The backend keeps the norms in memory,
                averages scores per modality across matched words, and stores nothing.
              </p>
            </details>
          </>
        )}
      </div>
    </div>
  );
};

export default SensorimotorAnalyser;
