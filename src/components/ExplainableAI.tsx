"use client";

import React from "react";
import { Cpu, HelpCircle, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { FeatureContribution } from "../lib/ml/engine";

interface ExplainableAIProps {
  contributions: FeatureContribution[];
  rawLogitZ: number;
}

export const ExplainableAI: React.FC<ExplainableAIProps> = ({ contributions, rawLogitZ }) => {
  // Find max absolute score for bar scaling
  const maxAbsScore = Math.max(...contributions.map(c => Math.abs(c.impactScore)), 0.1);

  return (
    <div className="glass-panel rounded-2xl p-6 mb-8 border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Explainable AI (XAI) Feature Attribution
          </h3>
          <p className="text-xs text-slate-400">
            SHAP-style feature importance breakdown showing how weather and personal habits influenced the score
          </p>
        </div>
        <div className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-mono">
          Baseline Logit Bias: -2.2 | Final Z: {rawLogitZ}
        </div>
      </div>

      <div className="space-y-4">
        {contributions.map((c, idx) => {
          const isPositive = c.impactScore >= 0;
          const barWidthPercent = Math.min(100, Math.max(8, (Math.abs(c.impactScore) / maxAbsScore) * 100));

          return (
            <div key={idx} className="glass-card rounded-xl p-3.5 border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-purple-400" />
                  )}
                  <span>{c.featureName}</span>
                  <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {c.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-normal">{c.description}</span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded ${
                      isPositive
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {isPositive ? `+${c.impactScore}` : c.impactScore}
                  </span>
                </div>
              </div>

              {/* Visual Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isPositive
                      ? "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-sm shadow-cyan-500/50"
                      : "bg-gradient-to-r from-purple-600 to-indigo-400 shadow-sm shadow-purple-500/50"
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <span>
          <strong>How to read:</strong> Blue/Cyan bars increase umbrella probability (push towards taking umbrella), while Purple/Indigo bars decrease it (push towards staying unburdened).
        </span>
      </div>
    </div>
  );
};
