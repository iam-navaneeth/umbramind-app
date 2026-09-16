"use client";

import React, { useState } from "react";
import { UserBehaviorProfile, CommuteMode, RainTolerance, UmbrellaPreference } from "../lib/ml/engine";
import { Sliders, Footprints, Bike, Bus, Car, ShieldAlert, Shield, Umbrella, Clock, Check } from "lucide-react";

interface UserProfileFormProps {
  profile: UserBehaviorProfile;
  onSaveProfile: (profile: UserBehaviorProfile) => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserBehaviorProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const commuteModes: Array<{ id: CommuteMode; label: string; icon: any; desc: string }> = [
    { id: "walking", label: "Walking", icon: Footprints, desc: "High exposure to open rain" },
    { id: "cycling", label: "Cycling", icon: Bike, desc: "Extreme vulnerability to rain & wind" },
    { id: "transit", label: "Transit / Bus", icon: Bus, desc: "Walking to bus/metro stops" },
    { id: "driving", label: "Driving Car", icon: Car, desc: "Sheltered vehicle (garage to garage)" },
  ];

  const rainTolerances: Array<{ id: RainTolerance; label: string; desc: string }> = [
    { id: "zero_tolerance", label: "Zero Rain Tolerance", desc: "Flag umbrella even if rain chance is only 15%" },
    { id: "moderate", label: "Balanced / Moderate", desc: "Standard sensitivity (bring umbrella around 35%+)" },
    { id: "risk_taker", label: "Rain-Tolerant / Minimalist", desc: "Only carry umbrella if heavy downpour (>60%)" },
  ];

  const umbrellaPrefs: Array<{ id: UmbrellaPreference; label: string; desc: string }> = [
    { id: "foldable", label: "Compact Foldable", desc: "Fits in bag, low hassle to carry" },
    { id: "stick", label: "Large Stick Umbrella", desc: "Sturdy in high wind, bulkier to carry" },
    { id: "jacket_only", label: "Rain Coat / Poncho Only", desc: "Prefers hands-free waterproof gear" },
  ];

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 lg:p-8 space-y-8 border-indigo-500/20">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Personal Habit & Behavior Profile
          </h2>
          <p className="text-xs text-slate-400">
            Tune the ML feature values according to your daily routine & transport preferences
          </p>
        </div>
        {savedSuccess && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 animate-pulse">
            <Check className="w-3.5 h-3.5" /> Saved & Model Retrained!
          </span>
        )}
      </div>

      {/* 1. Commute Transportation Mode */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Primary Transportation Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commuteModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = formData.commuteMode === mode.id;
            return (
              <button
                type="button"
                key={mode.id}
                onClick={() => setFormData({ ...formData, commuteMode: mode.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-indigo-950/80 to-purple-900/50 border-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "glass-card border-slate-800 hover:border-slate-700"
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                <div className="font-bold text-sm text-slate-100">{mode.label}</div>
                <div className="text-[11px] text-slate-400 mt-1">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Outdoor Exposure Minutes */}
      <div className="space-y-3 glass-card p-5 rounded-xl border-slate-800">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Outdoor Walking / Exposure Duration: <span className="text-cyan-300 text-sm font-extrabold">{formData.commuteDurationMinutes} Mins</span>
          </label>
        </div>
        <input
          type="range"
          min="5"
          max="90"
          step="5"
          value={formData.commuteDurationMinutes}
          onChange={(e) => setFormData({ ...formData, commuteDurationMinutes: Number(e.target.value) })}
          className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>5 Mins (Quick Dash)</span>
          <span>30 Mins (Medium Walk)</span>
          <span>90 Mins (Long Trek)</span>
        </div>
      </div>

      {/* 3. Rain Sensitivity Preference */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Personal Rain Risk Sensitivity
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rainTolerances.map((tol) => {
            const isSelected = formData.rainTolerance === tol.id;
            return (
              <button
                type="button"
                key={tol.id}
                onClick={() => setFormData({ ...formData, rainTolerance: tol.id })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-cyan-950/80 to-blue-900/50 border-cyan-500 shadow-lg shadow-cyan-500/20"
                    : "glass-card border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="font-bold text-sm text-slate-100 mb-1">{tol.label}</div>
                <div className="text-[11px] text-slate-400">{tol.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Waterproof Gear & Preferred Umbrella Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outerwear Toggle */}
        <div className="glass-card p-5 rounded-xl border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Carrying Hooded Raincoat / Jacket?
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Reduces reliance on carrying an umbrella
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, hasHoodedJacket: !formData.hasHoodedJacket })}
            className={`w-12 h-6 rounded-full transition-colors relative border ${
              formData.hasHoodedJacket ? "bg-purple-600 border-purple-400" : "bg-slate-800 border-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                formData.hasHoodedJacket ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Preferred Umbrella Type */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Preferred Umbrella Equipment
          </label>
          <select
            value={formData.umbrellaPreference}
            onChange={(e) => setFormData({ ...formData, umbrellaPreference: e.target.value as UmbrellaPreference })}
            className="w-full glass-input p-3 rounded-xl text-sm text-slate-200"
          >
            {umbrellaPrefs.map((pref) => (
              <option key={pref.id} value={pref.id} className="bg-slate-900 text-slate-200">
                {pref.label} — {pref.desc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all hover:scale-102 flex items-center gap-2"
        >
          <Sliders className="w-4 h-4" />
          Update Habit Profile & Recalculate Model
        </button>
      </div>
    </form>
  );
};
