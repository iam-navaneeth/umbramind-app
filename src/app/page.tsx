"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AppIntroHero } from "@/components/AppIntroHero";
import { WeatherHero } from "@/components/WeatherHero";
import { PredictionGauge } from "@/components/PredictionGauge";
import { ExplainableAI } from "@/components/ExplainableAI";
import { UserProfileForm } from "@/components/UserProfileForm";
import { MLDashboard } from "@/components/MLDashboard";
import { DailyFeedbackModal } from "@/components/DailyFeedbackModal";

import {
  fetchWeatherData,
  reverseGeocode,
  WeatherData,
} from "@/lib/weather/openMeteo";
import {
  UserBehaviorProfile,
  FeatureWeights,
  UserFeedbackLog,
  predictUmbrellaNeed,
  retrainModelWeights,
  evaluateModelPerformance,
} from "@/lib/ml/engine";
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredWeights,
  saveStoredWeights,
  getStoredLogs,
  saveStoredLogs,
} from "@/lib/storage/userHistory";

import { AlertCircle, RefreshCw, Sparkles, MapPin } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"predict" | "profile" | "ml-analytics">("predict");

  // Weather state
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Time slot selection state ("When are you going outside?")
  const [selectedHour, setSelectedHour] = useState<number | "now">("now");

  // User Habit Profile & ML weights state
  const [profile, setProfile] = useState<UserBehaviorProfile>(getStoredProfile);
  const [weights, setWeights] = useState<FeatureWeights>(getStoredWeights);
  const [logs, setLogs] = useState<UserFeedbackLog[]>(getStoredLogs);

  // Feedback modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Default coords: Palakkad, Kerala, India (10.7867, 76.6548)
  const [coords, setCoords] = useState<{ lat: number; lon: number; name?: string; country?: string }>({
    lat: 10.7867,
    lon: 76.6548,
    name: "Palakkad",
    country: "Kerala, India",
  });

  // Load weather when coords change
  useEffect(() => {
    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const data = await fetchWeatherData(coords.lat, coords.lon, coords.name, coords.country);
        setWeather(data);
      } catch (err: any) {
        setWeatherError(err.message || "Could not fetch weather forecast.");
      } finally {
        setWeatherLoading(false);
      }
    }
    loadWeather();
  }, [coords]);

  // Request HTML5 browser Geolocation with Reverse Geocoding on mount
  useEffect(() => {
    handleGeolocation();
  }, []);

  const handleGeolocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            // Accurate Reverse Geocoding for GPS lat/lon
            const placeInfo = await reverseGeocode(lat, lon);
            setCoords({
              lat,
              lon,
              name: placeInfo.name,
              country: placeInfo.country,
            });
          } catch (err) {
            setCoords({
              lat,
              lon,
              name: "Detected Location",
              country: "",
            });
          } finally {
            setIsLocating(false);
          }
        },
        async (err) => {
          console.warn("Geolocation permission denied or unavailable:", err.message);
          setIsLocating(false);
          // Fallback to IP location if geolocation denied
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.latitude && ipData.longitude) {
                setCoords({
                  lat: ipData.latitude,
                  lon: ipData.longitude,
                  name: ipData.city || "Detected City",
                  country: ipData.country_name || "",
                });
              }
            }
          } catch (ipErr) {
            console.warn("IP location fallback failed:", ipErr);
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  };

  const handleSelectLocation = (lat: number, lon: number, name: string, country: string) => {
    setCoords({ lat, lon, name, country });
    // Scroll smoothly to prediction gauge card
    if (typeof window !== "undefined") {
      const el = document.getElementById("umbrella-recommendation-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleSaveProfile = (newProfile: UserBehaviorProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
  };

  const handleAddLog = (newLogData: Omit<UserFeedbackLog, "id" | "timestamp">) => {
    const newLog: UserFeedbackLog = {
      ...newLogData,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString([], { dateStyle: "short", timeStyle: "short" }),
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveStoredLogs(updatedLogs);

    // Retrain model automatically with updated logs
    const { updatedWeights } = retrainModelWeights(weights, updatedLogs);
    setWeights(updatedWeights);
    saveStoredWeights(updatedWeights);
  };

  const handleManualRetrain = () => {
    const { updatedWeights } = retrainModelWeights(weights, logs);
    setWeights(updatedWeights);
    saveStoredWeights(updatedWeights);
  };

  // Compute prediction specifically for selected departure time
  const prediction = weather ? predictUmbrellaNeed(weather, profile, weights, selectedHour) : null;
  const metrics = evaluateModelPerformance(logs);

  return (
    <div className="min-h-screen pb-16 flex flex-col justify-between bg-slate-950 text-slate-100">
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentCity={weather?.city || coords.name || "Location"}
          onSelectLocation={handleSelectLocation}
          onUseGeolocation={handleGeolocation}
          isLocating={isLocating}
        />

        <main className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* App Introduction & Location Search Banner */}
          <AppIntroHero
            onSelectLocation={handleSelectLocation}
            onUseGeolocation={handleGeolocation}
            isLocating={isLocating}
            currentLocationName={coords.name || "Palakkad"}
          />

          {/* Weather Loading state */}
          {weatherLoading && (
            <div className="glass-panel rounded-2xl p-12 text-center my-8 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Fetching real-time weather for {coords.name || "selected location"}...</p>
              <p className="text-xs text-slate-500">Connecting to Open-Meteo & local weather endpoints</p>
            </div>
          )}

          {/* Weather Error state */}
          {weatherError && !weatherLoading && (
            <div className="glass-panel rounded-2xl p-6 my-8 border-rose-500/30 flex items-center gap-4 text-rose-300 bg-rose-950/20">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-400" />
              <div>
                <h4 className="font-bold text-sm text-rose-200">Weather API Connection Issue</h4>
                <p className="text-xs text-slate-400">{weatherError}</p>
              </div>
            </div>
          )}

          {/* TAB 1: PREDICTION & FORECAST VIEW */}
          {activeTab === "predict" && weather && prediction && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* 1ST ON MOBILE & DESKTOP: Umbrella Recommendation Gauge ("Umbrella Required or Not") */}
              <PredictionGauge
                prediction={prediction}
                weather={weather}
                selectedHour={selectedHour}
                onSelectHour={setSelectedHour}
                onOpenFeedbackModal={() => setIsFeedbackOpen(true)}
              />

              {/* 2ND DOWN BELOW: Detailed Weather Status & Hourly Timeline */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xl font-extrabold text-slate-100">
                    Detailed Weather & 12-Hour Forecast — {weather.city}
                  </h3>
                </div>
                <WeatherHero weather={weather} />
              </div>

              {/* 3RD: SHAP-style Explainable AI Feature Attribution */}
              <ExplainableAI
                contributions={prediction.featureContributions}
                rawLogitZ={prediction.mlLogits.rawZ}
              />
            </div>
          )}

          {/* TAB 2: USER PROFILE & HABIT TUNER */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-300">
              <UserProfileForm profile={profile} onSaveProfile={handleSaveProfile} />
            </div>
          )}

          {/* TAB 3: MACHINE LEARNING ANALYTICS & SIMULATOR */}
          {activeTab === "ml-analytics" && weather && (
            <div className="animate-in fade-in duration-300">
              <MLDashboard
                metrics={metrics}
                weights={weights}
                logs={logs}
                onRetrainModel={handleManualRetrain}
                baseWeather={weather}
                baseProfile={profile}
              />
            </div>
          )}

          {/* Daily Feedback Modal */}
          {prediction && weather && (
            <DailyFeedbackModal
              isOpen={isFeedbackOpen}
              onClose={() => setIsFeedbackOpen(false)}
              onSubmitLog={handleAddLog}
              currentRainProb={prediction.targetRainProb}
              currentMode={profile.commuteMode}
              currentPredictionProb={prediction.probabilityPercent}
              currentRecommendation={prediction.recommendation}
            />
          )}
        </main>
      </div>

      {/* Modern Footer */}
      <footer className="mt-16 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Umbrella App (UmbraMind AI)</span>
            <span>— Predictive Weather & Umbrella Companion</span>
          </div>
          <div>Vercel Ready | Powered by Open-Meteo, Nominatim & ML</div>
        </div>
      </footer>
    </div>
  );
}
