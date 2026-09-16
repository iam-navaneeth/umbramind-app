"use client";

import React from "react";
import { Umbrella, AlertTriangle, CheckCircle2, Info, Wind, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { PredictionResult } from "../lib/ml/engine";

interface PredictionGaugeProps {
  prediction: PredictionResult;
  onOpenFeedbackModal: () => void;
}

export const PredictionGauge: React.FC<PredictionGaugeProps> = ({ prediction, onOpenFeedbackModal }) => {
  const { probabilityPercent, recommendation, recommendationTitle, recommendationSubtitle, confidenceScore, windWarning, highRiskTimeWindow } = prediction;

  // Gauge colors based on risk level
  const getTheme = () => {
    switch (recommendation) {
      case "MUST_BRING":
        return {
          strokeColor: "#f43f5e", // Rose / Red
          glowColor: "rgba(244, 63, 94, 0.4)",
          badgeBg: "bg-rose-500/15 text-rose-300 border-rose-500/30",
          iconColor: "text-rose-400",
          cardBorder: "border-rose-500/30",
        };
      case "RECOMMENDED":
        return {
          strokeColor: "#06b6d4", // Cyan
          glowColor: "rgba(6, 182, 212, 0.4)",
          badgeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
          iconColor: "text-cyan-400",
          cardBorder: "border-cyan-500/30",
        };
      case "OPTIONAL_FOLDABLE":
        return {
          strokeColor: "#eab308", // Yellow / Amber
          glowColor: "rgba(234, 179, 8, 0.4)",
          badgeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          iconColor: "text-amber-400",
          cardBorder: "border-amber-500/30",
        };
      default:
        return {
          strokeColor: "#10b981", // Emerald Green
          glowColor: "rgba(16, 185, 129, 0.4)",
          badgeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          iconColor: "text-emerald-400",
          cardBorder: "border-emerald-500/30",
        };
    }
  };

  const theme = getTheme();

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probabilityPercent / 100) * circumference;

  return (
    <div className={`glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden border ${theme.cardBorder} transition-all duration-300`}>
      {/* Background glow circle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-500"
        style={{ background: theme.glowColor }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Side: Animated SVG Radial Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              {/* Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="14"
                fill="transparent"
              />
              {/* Progress Indicator */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={theme.strokeColor}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: `drop-shadow(0 0 12px ${theme.strokeColor})`,
                }}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <Umbrella className={`w-8 h-8 ${theme.iconColor} mb-1 animate-bounce-slow`} />
              <span className="text-4xl font-black text-slate-100 tracking-tight">
                {probabilityPercent}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Umbrella Index
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>ML Confidence: <strong className="text-slate-200">{confidenceScore}%</strong></span>
          </div>
        </div>

        {/* Right Side: ML Decision Recommendation Card */}
        <div className="flex-1 flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg} uppercase tracking-wider flex items-center gap-1.5`}>
              <Sparkles className="w-3 h-3" />
              {recommendation.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (Logit Z: {prediction.mlLogits.rawZ})
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight">
            {recommendationTitle}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            {recommendationSubtitle}
          </p>

          {/* Time Window Notification */}
          {highRiskTimeWindow && (
            <div className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-cyan-300">
              <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>{highRiskTimeWindow}</span>
            </div>
          )}

          {/* High Wind Warning Alert */}
          {windWarning && (
            <div className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <Wind className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
              <span>
                <strong>High Wind Warning:</strong> Wind gusts over 38 km/h expected. Traditional stick umbrellas may flip—a sturdy windproof model or rain coat is advised.
              </span>
            </div>
          )}

          {/* Action Button: Feedback Loop */}
          <div className="mt-2 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between">
            <span className="text-xs text-slate-400">Help retrain your personal ML model daily:</span>
            <button
              onClick={onOpenFeedbackModal}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102"
            >
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Log Rain Outcome Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
