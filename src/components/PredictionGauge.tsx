"use client";

import React from "react";
import { Umbrella, AlertTriangle, CheckCircle2, Wind, Clock, ShieldCheck, Sparkles, Calendar, ChevronRight } from "lucide-react";
import { PredictionResult } from "../lib/ml/engine";
import { WeatherData } from "../lib/weather/openMeteo";

interface PredictionGaugeProps {
  prediction: PredictionResult;
  weather: WeatherData;
  selectedHour: number | "now";
  onSelectHour: (hour: number | "now") => void;
  onOpenFeedbackModal: () => void;
}

export const PredictionGauge: React.FC<PredictionGaugeProps> = ({
  prediction,
  weather,
  selectedHour,
  onSelectHour,
  onOpenFeedbackModal,
}) => {
  const {
    probabilityPercent,
    recommendation,
    recommendationTitle,
    recommendationSubtitle,
    confidenceScore,
    windWarning,
    selectedTimeLabel,
    targetRainProb,
    highRiskTimeWindow,
  } = prediction;

  // Colors based on risk level
  const getTheme = () => {
    switch (recommendation) {
      case "MUST_BRING":
        return {
          strokeColor: "#f43f5e", // Rose
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
    <div className={`glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden border ${theme.cardBorder} transition-all duration-300 mb-8`}>
      {/* Background glow circle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-500"
        style={{ background: theme.glowColor }}
      />

      <div className="relative z-10 space-y-6">
        {/* TIME SLOT SELECTOR: "When are you going outside?" */}
        <div className="glass-card p-4 rounded-xl border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Departure Schedule Selector</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              When are you heading outside today?
            </h3>
            <p className="text-xs text-slate-400">Select a target hour to calculate exact rain probability and umbrella need.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Quick Chip: NOW */}
            <button
              onClick={() => onSelectHour("now")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedHour === "now"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              ⚡ Current Now
            </button>

            {/* Quick Chips: Hourly options */}
            {weather.forecast12h.hourly.slice(0, 5).map((h, i) => {
              const hNum = new Date(h.time).getHours();
              const isSelected = selectedHour === hNum;
              return (
                <button
                  key={i}
                  onClick={() => onSelectHour(hNum)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20"
                      : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {h.hourLabel} <span className="text-[10px] opacity-75">({h.rainProb}%)</span>
                </button>
              );
            })}

            {/* Dropdown for All 12 Hours */}
            <select
              value={selectedHour}
              onChange={(e) => {
                const val = e.target.value;
                onSelectHour(val === "now" ? "now" : Number(val));
              }}
              className="glass-input px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200"
            >
              <option value="now" className="bg-slate-900">Current Situation</option>
              {weather.forecast12h.hourly.map((h, idx) => {
                const hNum = new Date(h.time).getHours();
                return (
                  <option key={idx} value={hNum} className="bg-slate-900">
                    {h.hourLabel} — Rain {h.rainProb}% ({Math.round(h.temp)}°C)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Prediction Display Grid */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-2">
          {/* Left Side: Radial Gauge */}
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
                  Umbrella Need
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Rain Chance: <strong className="text-cyan-300">{targetRainProb}%</strong></span>
            </div>
          </div>

          {/* Right Side: Recommendation Summary Card */}
          <div className="flex-1 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg} uppercase tracking-wider flex items-center gap-1.5`}>
                <Sparkles className="w-3 h-3" />
                {recommendation.replace("_", " ")}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {selectedTimeLabel}
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight">
              {recommendationTitle}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              {recommendationSubtitle}
            </p>

            {/* Threshold Rule Info */}
            <div className="w-full text-xs p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400">
              <div className="font-semibold text-slate-300 mb-1">Threshold Accuracy Rules:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                <li>Rain chance &lt; 20% → Low umbrella score (&lt;25%, stay unburdened)</li>
                <li>Rain chance 20%–25% → Calibrated to ~50% (Optional compact umbrella)</li>
                <li>Rain chance 25%–50% → Calibrated to 75%–80% (Recommended)</li>
                <li>Rain chance &gt; 50% → Calibrated to 80%+ (Definite Umbrella Required)</li>
              </ul>
            </div>

            {/* High Wind Warning Alert */}
            {windWarning && (
              <div className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                <Wind className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                <span>
                  <strong>High Wind Alert:</strong> Wind gusts over 38 km/h expected during this time slot. Use a heavy-duty windproof umbrella or waterproof jacket.
                </span>
              </div>
            )}

            {/* Action Button: Feedback Loop */}
            <div className="mt-2 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between">
              <span className="text-xs text-slate-400">Help fine-tune your model daily:</span>
              <button
                onClick={onOpenFeedbackModal}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Log Outcome Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
