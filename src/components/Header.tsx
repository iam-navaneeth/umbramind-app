"use client";

import React, { useState } from "react";
import { Umbrella, MapPin, Search, Sparkles, Sliders, Cpu, Compass, RefreshCw, Navigation } from "lucide-react";
import { searchLocations, GeocodingResult } from "../lib/weather/openMeteo";

interface HeaderProps {
  activeTab: "predict" | "profile" | "ml-analytics";
  setActiveTab: (tab: "predict" | "profile" | "ml-analytics") => void;
  currentCity: string;
  onSelectLocation: (lat: number, lon: number, name: string, country: string) => void;
  onUseGeolocation: () => void;
  isLocating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentCity,
  onSelectLocation,
  onUseGeolocation,
  isLocating,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const res = await searchLocations(val);
      setResults(res);
      setIsSearching(false);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item: GeocodingResult) => {
    onSelectLocation(item.latitude, item.longitude, item.name, item.admin1 ? `${item.admin1}, ${item.country}` : item.country);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-3 sm:px-6 lg:px-8 py-3 mb-4 sm:mb-6 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo & Mobile GPS Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setActiveTab("predict")}>
            <div className="relative p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform duration-300">
              <Umbrella className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-300 bg-clip-text text-transparent">
                  Umbrella App
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  UmbraMind AI
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Predictive Umbrella AI — <span className="text-cyan-300 font-semibold">Developed by Navaneeth Krishnan</span>
              </p>
            </div>
          </div>

          {/* Location Bar Mobile */}
          <button
            onClick={onUseGeolocation}
            disabled={isLocating}
            className="md:hidden p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 text-xs font-semibold"
            title="Use My GPS Location"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-cyan-400" : ""}`} />
            {isLocating ? "GPS..." : "GPS"}
          </button>
        </div>

        {/* Location Search Input */}
        <div className="relative w-full md:max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
              placeholder={`Current: ${currentCity} — Search city...`}
              className="w-full glass-input pl-9 pr-20 sm:pr-24 py-2 text-xs sm:text-sm rounded-xl text-slate-100 placeholder:text-slate-500 border-slate-800 focus:border-cyan-500/50"
            />
            <button
              onClick={onUseGeolocation}
              disabled={isLocating}
              className="absolute right-1.5 flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all"
            >
              {isLocating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>

          {/* Location Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
              {isSearching ? (
                <div className="p-3 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Searching places...
                </div>
              ) : results.length > 0 ? (
                results.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(res)}
                    className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm hover:bg-cyan-500/15 flex items-center justify-between border-b border-slate-800 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="font-bold text-slate-200 truncate">{res.name}</span>
                      <span className="text-[11px] text-slate-400 truncate hidden sm:inline">{res.admin1}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded flex-shrink-0">
                      {res.country}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-slate-400 text-center">No locations found.</div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-white/10 w-full md:w-auto justify-center">
          <button
            onClick={() => setActiveTab("predict")}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
              activeTab === "predict"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Prediction
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Habit Profile
          </button>
          <button
            onClick={() => setActiveTab("ml-analytics")}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl transition-all ${
              activeTab === "ml-analytics"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            ML Analytics
          </button>
        </nav>
      </div>
    </header>
  );
};
