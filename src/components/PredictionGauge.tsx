"use client";

import React from "react";
import { Umbrella, CheckCircle2, Wind, Clock, ShieldCheck, Sparkles, AlertTriangle, AlertCircle } from "lucide-react";
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
    targetRainMm,
  } = prediction;

  // Colors and badges based on risk level
  const getTheme = () => {
    switch (recommendation) {
      case "MUST_BRING":
        return {
          strokeColor: "#f43f5e", // Rose
          glowColor: "rgba(244, 63, 94, 0.4)",
          badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse",
          bannerBg: "bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900/90 border-rose-500/50",
          iconColor: "text-rose-400",
          cardBorder: "border-rose-500/40 shadow-rose-950/30",
          decisionTag: "YES - UMBRELLA REQUIRED!",
          tagColor: "bg-rose-600 text-white font-black",
        };
      case "RECOMMENDED":
        return {
          strokeColor: "#06b6d4", // Cyan
          glowColor: "rgba(6, 182, 212, 0.4)",
          badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          bannerBg: "bg-gradient-to-r from-cyan-950/80 via-sky-900/40 to-slate-900/90 border-cyan-500/50",
          iconColor: "text-cyan-400",
          cardBorder: "border-cyan-500/40 shadow-cyan-950/30",
          decisionTag: "UMBRELLA RECOMMENDED",
          tagColor: "bg-cyan-500 text-slate-950 font-black",
        };
      case "OPTIONAL_FOLDABLE":
        return {
          strokeColor: "#eab308", // Amber
          glowColor: "rgba(234, 179, 8, 0.4)",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          bannerBg: "bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-slate-900/90 border-amber-500/50",
          iconColor: "text-amber-400",
          cardBorder: "border-amber-500/40 shadow-amber-950/30",
          decisionTag: "OPTIONAL FOLDABLE UMBRELLA",
          tagColor: "bg-amber-500 text-slate-950 font-black",
        };
      default:
        return {
          strokeColor: "#10b981", // Emerald Green
          glowColor: "rgba(16, 185, 129, 0.4)",
          badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          bannerBg: "bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-slate-900/90 border-emerald-500/50",
          iconColor: "text-emerald-400",
          cardBorder: "border-emerald-500/40 shadow-emerald-950/30",
          decisionTag: "NO UMBRELLA NEEDED",
          tagColor: "bg-emerald-500 text-slate-950 font-black",
        };
    }
  };

  const theme = getTheme();

  // SVG Gauge calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probabilityPercent / 100) * circumference;

  return (
    <div id="umbrella-recommendation-card" className={`glass-panel rounded-3xl p-5 sm:p-7 relative overflow-hidden border ${theme.cardBorder} transition-all duration-300 shadow-2xl mb-8`}>
      {/* Background glow circle */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-500"
        style={{ background: theme.glowColor }}
      />

      <div className="relative z-10 space-y-6">
        {/* TOP STATUS HIGHLIGHT BAR FOR MOBILE & DESKTOP */}
        <div className={`p-4 rounded-2xl border ${theme.bannerBg} flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg`}>
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className={`p-3 rounded-xl ${theme.tagColor} shadow-md flex items-center justify-center flex-shrink-0`}>
              <Umbrella className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 block">
                Target Location: <strong className="text-slate-200">{weather.city}</strong>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                {theme.decisionTag}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${theme.badgeBg} flex items-center gap-1.5 shadow-sm`}>
              <Sparkles className="w-3.5 h-3.5" />
              {recommendation.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* TIME SLOT SELECTOR: "When are you going outside?" */}
        <div className="glass-card p-4 rounded-2xl border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Select Departure Time</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              When are you stepping outside today?
            </h3>
            <p className="text-xs text-slate-400">Select an hour slot to check targeted rain probability & umbrella requirement.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Quick Chip: NOW */}
            <button
              onClick={() => onSelectHour("now")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedHour === "now"
                  ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30 scale-105"
                  : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
            >
              ⚡ Current Now
            </button>

            {/* Quick Chips: Hourly options */}
            {weather.forecast12h.hourly.slice(0, 4).map((h, i) => {
              const hNum = new Date(h.time).getHours();
              const isSelected = selectedHour === hNum;
              return (
                <button
                  key={i}
                  onClick={() => onSelectHour(hNum)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30 scale-105"
                      : "bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {h.hourLabel} <span className="text-[10px] opacity-80">({h.rainProb}%)</span>
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
              className="glass-input px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 border-slate-700 bg-slate-900"
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          {/* Left Side: Radial Gauge */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-800/90"
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
                  Umbrella Risk
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Rain Chance: <strong className="text-cyan-300">{targetRainProb}%</strong></span>
            </div>
          </div>

          {/* Right Side: Detailed Recommendation Summary Card */}
          <div className="flex-1 flex flex-col items-start gap-3 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono font-medium">
                {selectedTimeLabel}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                Rain Vol: {targetRainMm} mm
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {recommendationTitle}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {recommendationSubtitle}
            </p>

            {/* High Wind Warning Alert */}
            {windWarning && (
              <div className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-300 shadow-sm">
                <Wind className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                <span>
                  <strong>High Wind Alert:</strong> Wind speed around {prediction.targetWindSpeed} km/h expected. Take a sturdy windproof umbrella or hooded waterproof coat!
                </span>
              </div>
            )}

            {/* Action Button: Feedback Loop */}
            <div className="mt-2 pt-3 border-t border-slate-800/80 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Help retrain your personal ML model:</span>
              <button
                onClick={onOpenFeedbackModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-102"
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
