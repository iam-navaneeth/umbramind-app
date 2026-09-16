"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Umbrella, CloudRain, Sparkles } from "lucide-react";
import { UserFeedbackLog, CommuteMode } from "../lib/ml/engine";

interface DailyFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLog: (log: Omit<UserFeedbackLog, "id" | "timestamp">) => void;
  currentRainProb: number;
  currentMode: CommuteMode;
  currentPredictionProb: number;
  currentRecommendation: string;
}

export const DailyFeedbackModal: React.FC<DailyFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmitLog,
  currentRainProb,
  currentMode,
  currentPredictionProb,
  currentRecommendation,
}) => {
  const [carriedUmbrella, setCarriedUmbrella] = useState(true);
  const [actuallyRained, setActuallyRained] = useState(true);
  const [actuallyNeeded, setActuallyNeeded] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitLog({
      weatherSummary: `Logged Day (${currentRainProb}% Forecast)`,
      maxRainProb: currentRainProb,
      commuteMode: currentMode,
      predictedProbability: currentPredictionProb,
      predictedRecommendation: currentRecommendation,
      userCarriedUmbrella: carriedUmbrella,
      actuallyRained: actuallyRained,
      actualNeededUmbrella: actuallyNeeded,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative border-cyan-500/30 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">Log Daily Weather Feedback</h3>
            <p className="text-xs text-slate-400">Help retrain your personal ML model weights with ground truth</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question 1: Did you carry an umbrella? */}
          <div className="glass-card p-4 rounded-xl border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Did you end up bringing an umbrella with you?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCarriedUmbrella(true)}
                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                  carriedUmbrella
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                Yes, Carried Umbrella
              </button>
              <button
                type="button"
                onClick={() => setCarriedUmbrella(false)}
                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                  !carriedUmbrella
                    ? "bg-slate-800 text-slate-200 border-slate-700"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                No, Left it at home
              </button>
            </div>
          </div>

          {/* Question 2: Did it actually rain? */}
          <div className="glass-card p-4 rounded-xl border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Did it actually rain during your commute outdoor time?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setActuallyRained(true);
                  setActuallyNeeded(true);
                }}
                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                  actuallyRained
                    ? "bg-blue-500/20 text-blue-300 border-blue-500"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                Yes, It Rained / Drizzled
              </button>
              <button
                type="button"
                onClick={() => {
                  setActuallyRained(false);
                  setActuallyNeeded(false);
                }}
                className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                  !actuallyRained
                    ? "bg-slate-800 text-slate-200 border-slate-700"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                No, Stayed Dry
              </button>
            </div>
          </div>

          {/* Ground Truth Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <input
              type="checkbox"
              id="neededCheck"
              checked={actuallyNeeded}
              onChange={(e) => setActuallyNeeded(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
            <label htmlFor="neededCheck" className="text-xs text-slate-300 cursor-pointer">
              Confirm Ground Truth: <strong>{actuallyNeeded ? "Umbrella was truly needed" : "Umbrella was unnecessary"}</strong>
            </label>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save & Update Model Weights
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
