"use client";

import React, { useState } from "react";
import { Cpu, BarChart3, CheckCircle2, AlertOctagon, Sliders, RefreshCw, Zap, Award, Flame, PlayCircle } from "lucide-react";
import { FeatureWeights, MLModelMetrics, UserFeedbackLog, predictUmbrellaNeed, CommuteMode } from "../lib/ml/engine";
import { WeatherData } from "../lib/weather/openMeteo";
import { UserBehaviorProfile } from "../lib/ml/engine";

interface MLDashboardProps {
  metrics: MLModelMetrics;
  weights: FeatureWeights;
  logs: UserFeedbackLog[];
  onRetrainModel: () => void;
  baseWeather: WeatherData;
  baseProfile: UserBehaviorProfile;
}

export const MLDashboard: React.FC<MLDashboardProps> = ({
  metrics,
  weights,
  logs,
  onRetrainModel,
  baseWeather,
  baseProfile,
}) => {
  // Scenario Simulator Interactive State
  const [simRainProb, setSimRainProb] = useState<number>(65);
  const [simRainMm, setSimRainMm] = useState<number>(4.5);
  const [simWindSpeed, setSimWindSpeed] = useState<number>(25);
  const [simDuration, setSimDuration] = useState<number>(25);
  const [simMode, setSimMode] = useState<CommuteMode>("walking");

  // Construct simulated weather object
  const simWeather: WeatherData = {
    ...baseWeather,
    forecast12h: {
      ...baseWeather.forecast12h,
      maxRainProb: simRainProb,
      totalRainMm: simRainMm,
      maxWindSpeed: simWindSpeed,
      hourly: baseWeather.forecast12h.hourly.map(h => ({
        ...h,
        rainProb: simRainProb,
        rainMm: simRainMm / 3,
        windSpeed: simWindSpeed,
      })),
    },
  };

  const simProfile: UserBehaviorProfile = {
    ...baseProfile,
    commuteMode: simMode,
    commuteDurationMinutes: simDuration,
  };

  const simResult = predictUmbrellaNeed(simWeather, simProfile, weights);

  return (
    <div className="space-y-8">
      {/* Metrics Banner Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Model Accuracy</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">
            {metrics.accuracyPercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Correct predictions / Total logs</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-indigo-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Precision</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 font-mono">
            {metrics.precisionPercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">True positive / Predicted positive</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-purple-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Recall</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-300 font-mono">
            {metrics.recallPercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">True positive / Actual rain days</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border-pink-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>F1 Score</span>
            <Flame className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-extrabold text-pink-300 font-mono">
            {metrics.f1Score}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Harmonic mean of precision & recall</p>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix & Retraining + Interactive What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Confusion Matrix & Training Logs */}
        <div className="glass-panel rounded-2xl p-6 border-purple-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  Confusion Matrix & Online Learning
                </h3>
                <p className="text-xs text-slate-400">2x2 Classification performance matrix evaluated against user logs</p>
              </div>
              <button
                onClick={onRetrainModel}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/30 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Run SGD Retrain
              </button>
            </div>

            {/* Matrix Visual Grid */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                  True Positive (TP)
                </div>
                <div className="text-3xl font-extrabold text-slate-100 font-mono my-1">
                  {metrics.truePositives}
                </div>
                <div className="text-[11px] text-slate-400">Predicted Umbrella & Rained</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400">
                  False Positive (FP)
                </div>
                <div className="text-3xl font-extrabold text-slate-100 font-mono my-1">
                  {metrics.falsePositives}
                </div>
                <div className="text-[11px] text-slate-400">Predicted Umbrella but Clear</div>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <div className="text-[11px] uppercase tracking-wider font-bold text-rose-400">
                  False Negative (FN)
                </div>
                <div className="text-3xl font-extrabold text-slate-100 font-mono my-1">
                  {metrics.falseNegatives}
                </div>
                <div className="text-[11px] text-slate-400">Predicted Clear but Rained</div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="text-[11px] uppercase tracking-wider font-bold text-cyan-400">
                  True Negative (TN)
                </div>
                <div className="text-3xl font-extrabold text-slate-100 font-mono my-1">
                  {metrics.trueNegatives}
                </div>
                <div className="text-[11px] text-slate-400">Predicted Clear & Stayed Dry</div>
              </div>
            </div>

            {/* Model Feature Weights Table */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Learned Feature Coefficients (Weights $w$)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span>$w_{'{rain\_prob}'}$:</span>
                  <span className="text-cyan-400">{weights.rainProbability.toFixed(3)}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span>$w_{'{precip\_mm}'}$:</span>
                  <span className="text-cyan-400">{weights.precipitationVolume.toFixed(3)}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span>$w_{'{commute\_mins}'}$:</span>
                  <span className="text-purple-400">{weights.commuteDuration.toFixed(3)}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span>$w_{'{walking}'}$:</span>
                  <span className="text-purple-400">{weights.commuteModeWalking.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive "What-If" Scenario Simulator */}
        <div className="glass-panel rounded-2xl p-6 border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-cyan-400" />
                  Interactive "What-If" Simulator
                </h3>
                <p className="text-xs text-slate-400">Test how the ML decision boundary shifts under custom weather conditions</p>
              </div>
            </div>

            {/* Live Simulation Output Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Simulated Prediction</span>
                <div className="text-xl font-bold text-slate-100 mt-0.5">
                  {simResult.recommendationTitle}
                </div>
                <span className="text-xs text-cyan-300 font-mono">
                  Confidence: {simResult.confidenceScore}% (Z: {simResult.mlLogits.rawZ})
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-cyan-400 font-mono">
                  {simResult.probabilityPercent}%
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Umbrella Need</span>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 text-xs">
              {/* Slider 1: Rain Probability */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Rain Chance Forecast</span>
                  <span className="text-cyan-400 font-mono font-bold">{simRainProb}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simRainProb}
                  onChange={(e) => setSimRainProb(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              {/* Slider 2: Rain Volume mm */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Precipitation Volume</span>
                  <span className="text-sky-400 font-mono font-bold">{simRainMm} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={simRainMm}
                  onChange={(e) => setSimRainMm(Number(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              {/* Slider 3: Outdoor Exposure Mins */}
              <div className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-300">Outdoor Exposure Duration</span>
                  <span className="text-indigo-400 font-mono font-bold">{simDuration} Mins</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={simDuration}
                  onChange={(e) => setSimDuration(Number(e.target.value))}
                  className="w-full accent-indigo-400 bg-slate-800 h-2 rounded-lg"
                />
              </div>

              {/* Mode Select */}
              <div className="space-y-1 pt-2">
                <label className="block font-semibold text-slate-300">Transport Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["walking", "cycling", "transit", "driving"] as CommuteMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSimMode(m)}
                      className={`p-2 rounded-lg border text-center font-bold capitalize transition-all ${
                        simMode === m
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
