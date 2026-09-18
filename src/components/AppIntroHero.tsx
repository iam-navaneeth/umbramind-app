"use client";

import React, { useState } from "react";
import { Umbrella, Search, MapPin, Compass, Sparkles, Navigation, CloudRain, ShieldCheck, Zap } from "lucide-react";
import { searchLocations, GeocodingResult } from "../lib/weather/openMeteo";

interface AppIntroHeroProps {
  onSelectLocation: (lat: number, lon: number, name: string, country: string) => void;
  onUseGeolocation: () => void;
  isLocating: boolean;
  currentLocationName: string;
}

const FEATURED_PLACES = [
  { name: "Palakkad", admin: "Kerala, India", lat: 10.7867, lon: 76.6548, tag: "🌴 District" },
  { name: "Pallassana", admin: "Palakkad, Kerala", lat: 10.6625, lon: 76.6212, tag: "🏡 Local" },
  { name: "Kollengode", admin: "Palakkad, Kerala", lat: 10.6122, lon: 76.6496, tag: "🌿 Scenic" },
  { name: "Cheramangalam", admin: "Palakkad, Kerala", lat: 10.7410, lon: 76.5910, tag: "🎵 Village" },
  { name: "Kochi", admin: "Kerala, India", lat: 9.9312, lon: 76.2673, tag: "🌊 Coastal" },
  { name: "London", admin: "United Kingdom", lat: 51.5074, lon: -0.1278, tag: "🌧️ Rainy" },
  { name: "New York", admin: "United States", lat: 40.7128, lon: -74.0060, tag: "🗽 Metro" },
  { name: "Tokyo", admin: "Japan", lat: 35.6762, lon: 139.6503, tag: "🗼 Global" },
];

export const AppIntroHero: React.FC<AppIntroHeroProps> = ({
  onSelectLocation,
  onUseGeolocation,
  isLocating,
  currentLocationName,
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

  const handleSelectResult = (item: GeocodingResult) => {
    onSelectLocation(item.latitude, item.longitude, item.name, item.admin1 ? `${item.admin1}, ${item.country}` : item.country);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <section className="mb-8">
      {/* Intro Banner Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border-cyan-500/30 shadow-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-indigo-950/70">
        {/* Glow ambient lights */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          {/* Header Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>Welcome to UMBERLA APP (UmbraMind AI)</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Should You Carry An{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent underline decoration-cyan-500/40 underline-offset-8">
              Umbrella Today?
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Search your place to check if you need to bring an umbrella today!
          </p>

          {/* SEARCH YOUR PLACE INTERACTIVE BOX */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 p-2 rounded-2xl bg-slate-950/90 border border-cyan-500/40 shadow-xl backdrop-blur-xl">
                {/* Search Input */}
                <div className="relative flex-1 w-full flex items-center">
                  <Search className="absolute left-3.5 w-5 h-5 text-cyan-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                    placeholder="Search your place (e.g. Pallassana, Kollengode, Palakkad)..."
                    className="w-full bg-slate-900/90 text-slate-100 placeholder:text-slate-500 pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-slate-800 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowDropdown(false);
                      }}
                      className="absolute right-3 text-xs text-slate-400 hover:text-slate-200"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* GPS Location Button */}
                <button
                  onClick={onUseGeolocation}
                  disabled={isLocating}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all flex-shrink-0 active:scale-98"
                >
                  <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
                  <span>{isLocating ? "Detecting GPS..." : "Detect Location"}</span>
                </button>
              </div>

              {/* Autocomplete Results Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 border border-cyan-500/30 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl text-left">
                  {isSearching ? (
                    <div className="p-4 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      Searching places...
                    </div>
                  ) : results.length > 0 ? (
                    results.map((res, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectResult(res)}
                        className="w-full text-left px-4 py-3 text-xs sm:text-sm hover:bg-cyan-500/15 flex items-center justify-between border-b border-slate-800/80 last:border-0 transition-colors group"
                      >
                        <div className="flex items-center gap-3 truncate pr-2">
                          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block truncate">{res.name}</span>
                            <span className="text-[11px] text-slate-400 truncate">{res.admin1 || "Region"}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-cyan-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex-shrink-0">
                          {res.country}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-400 text-center">
                      No matching place found. Try another place name!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* QUICK PLACE SHORTCUTS */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-2.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tap a popular location to check umbrella need instantly:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              {FEATURED_PLACES.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectLocation(place.lat, place.lon, place.name, place.admin)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span>{place.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({place.tag})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-400 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Umbrella Yes/No</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span>12-Hour Hourly Rain Timeline</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Commute ML Personalization</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
