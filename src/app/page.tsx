"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { WeatherHero } from "@/components/WeatherHero";
import { PredictionGauge } from "@/components/PredictionGauge";
import { ExplainableAI } from "@/components/ExplainableAI";
import { UserProfileForm } from "@/components/UserProfileForm";
import { MLDashboard } from "@/components/MLDashboard";
import { DailyFeedbackModal } from "@/components/DailyFeedbackModal";

import {
  fetchWeatherData,
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

import { AlertCircle, RefreshCw, Sparkles } from "lucide-react";

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

  // Default coords: London
  const [coords, setCoords] = useState<{ lat: number; lon: number; name?: string; country?: string }>({
    lat: 51.5074,
    lon: -0.1278,
    name: "London",
    country: "United Kingdom",
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

  // Request HTML5 browser Geolocation on mount
  useEffect(() => {
    handleGeolocation();
  }, []);

  const handleGeolocation = () => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            name: "Current Location",
            country: "",
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation permission denied or unavailable:", err.message);
          setIsLocating(false);
        },
        { timeout: 10000 }
      );
    }
  };

  const handleSelectLocation = (lat: number, lon: number, name: string, country: string) => {
    setCoords({ lat, lon, name, country });
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
    <div className="min-h-screen pb-16 flex flex-col justify-between">
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
          {/* Weather Loading state */}
          {weatherLoading && (
            <div className="glass-panel rounded-2xl p-12 text-center my-8 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-300">Fetching real-time weather & 24h forecast...</p>
              <p className="text-xs text-slate-500">Connecting to Open-Meteo meteorological endpoints</p>
            </div>
          )}

          {/* Weather Error state */}
          {weatherError && !weatherLoading && (
            <div className="glass-panel rounded-2xl p-6 my-8 border-rose-500/30 flex items-center gap-4 text-rose-300">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Weather API Connection Issue</h4>
                <p className="text-xs text-slate-400">{weatherError}</p>
              </div>
            </div>
          )}

          {/* TAB 1: PREDICTION & FORECAST VIEW */}
          {activeTab === "predict" && weather && prediction && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Weather Status & Hourly Timeline */}
              <WeatherHero weather={weather} />

              {/* Umbrella Recommendation Gauge & Departure Time Selector Card */}
              <PredictionGauge
                prediction={prediction}
                weather={weather}
                selectedHour={selectedHour}
                onSelectHour={setSelectedHour}
                onOpenFeedbackModal={() => setIsFeedbackOpen(true)}
              />

              {/* SHAP-style Explainable AI Feature Attribution */}
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

          {/* Feedback Modal */}
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
            <span className="font-semibold text-slate-300">UmbraMind AI</span>
            <span>— Developed by Navaneeth Krishnan</span>
          </div>
          <div>Vercel Ready | Powered by Open-Meteo & Browser ML</div>
        </div>
      </footer>
    </div>
  );
}
