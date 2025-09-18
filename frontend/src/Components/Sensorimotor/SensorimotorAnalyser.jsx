-import { aggregateProfile } from "./smUtils";
-import { loadNormsMap } from "./smParser";
+// Backend mode: call Django to compute (no dataset sent to browser)
+const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://<your-render-service>.onrender.com";

export default function SensorimotorAnalyser() {
-  const [status, setStatus] = useState("idle");
-  const [normsMap, setNormsMap] = useState(null);
+  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

-  useEffect(() => { /* no-op: we don't need to load a CSV/JSON */ }, []);
+  useEffect(() => { /* no-op */ }, []);

  async function handleAnalyze(words) {
-    if (!normsMap) return;
-    setStatus("analyzing");
-    const out = aggregateProfile(words, normsMap);
-    setResult(out);
+    setStatus("analyzing");
+    try {
+      const res = await fetch(`${BACKEND_URL}/api/sm/profile/`, {
+        method: "POST",
+        headers: { "Content-Type": "application/json" },
+        body: JSON.stringify({ words }),
+      });
+      if (!res.ok) throw new Error(`HTTP ${res.status}`);
+      const data = await res.json();
+      // Adapt backend shape to existing UI { profile, matchedCount, perWord }
+      const profile = {};
+      data.modalities.forEach((m, i) => profile[m] = data.profile[i]);
+      setResult({ profile, matchedCount: data.matchedCount, perWord: [] });
+    } catch (e) {
+      setError("Analysis failed. Check backend URL/CORS.");
+      setStatus("error");
+      return;
+    }
     setStatus("done");
  }
