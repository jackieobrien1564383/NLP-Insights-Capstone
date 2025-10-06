import React from "react";
import SentimentSummary from "./SentimentSummary";
import EmotionBars from "./EmotionBars";
import SentimentWordList, { OOVList } from "./SentimentWordList";

export default function SentimentResults({ data }) {
    const summary = data?.summary || {};
    const emotions = data?.emotions || {};
    const pos = data?.top_contributors?.positive || [];
    const neg = data?.top_contributors?.negative || [];
    const oov = summary?.oov_examples || [];

    return (
    <div className="tcc-stack-lg">
      {/* Summary + Emotion bars */}
      <div className="tcc-grid tcc-grid-2-md">
        <div className="tcc-panel">
          <SentimentSummary summary={summary} />
        </div>
        <div className="tcc-panel">
          <h3 className="tcc-title tcc-title--sm">Emotion Averages</h3>
          <EmotionBars emotions={emotions} />
        </div>
      </div>

      {/* Word lists */}
      <div className="tcc-grid tcc-grid-3-lg">
        <div className="tcc-panel">
          <SentimentWordList title="Top Positive" rows={pos} sign="pos" />
        </div>
        <div className="tcc-panel">
          <SentimentWordList title="Top Negative" rows={neg} sign="neg" />
        </div>
        <div className="tcc-panel">
          <OOVList pairs={oov} />
        </div>
      </div>
    </div>
  );
}
