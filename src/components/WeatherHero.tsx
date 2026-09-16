"use client";

import React from "react";
import { CloudRain, Wind, Droplets, Cloud, Sun, CloudDrizzle, CloudLightning, Snowflake } from "lucide-react";
import { WeatherData, getWeatherCondition } from "../lib/weather/openMeteo";

interface WeatherHeroProps {
  weather: WeatherData;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({ weather }) => {
  const cond = getWeatherCondition(weather.current.weatherCode);

  const renderWeatherIcon = (code: number, className: string = "w-8 h-8") => {
    if (code === 0) return <Sun className={`${className} text-amber-400 animate-spin-slow`} />;
    if (code >= 1 && code <= 3) return <Cloud className={`${className} text-sky-300`} />;
    if (code >= 51 && code <= 57) return <CloudDrizzle className={`${className} text-cyan-300`} />;
    if (code >= 61 && code <= 67) return <CloudRain className={`${className} text-blue-400`} />;
    if (code >= 71 && code <= 77) return <Snowflake className={`${className} text-indigo-200`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-cyan-400`} />;
    if (code >= 95) return <CloudLightning className={`${className} text-amber-300`} />;
    return <Cloud className={`${className} text-slate-400`} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Current Weather Card */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border-cyan-500/20">
        {/* Glow background accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                {weather.city}
              </h2>
              <p className="text-xs text-slate-400 font-medium">{weather.country || "Detected Location"}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 shadow-inner">
              {renderWeatherIcon(weather.current.weatherCode, "w-10 h-10")}
            </div>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              {weather.current.temp}°C
            </span>
            <span className="text-sm font-semibold text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              {cond.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Droplets className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Humidity</span>
            <span className="text-xs font-bold text-slate-200">{weather.current.humidity}%</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Wind className="w-4 h-4 text-sky-400 mb-1" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Wind</span>
            <span className="text-xs font-bold text-slate-200">{weather.current.windSpeed} km/h</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <CloudRain className="w-4 h-4 text-indigo-400 mb-1" />
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Rain Prob</span>
            <span className="text-xs font-bold text-cyan-300">{weather.forecast12h.maxRainProb}%</span>
          </div>
        </div>
      </div>

      {/* 12-Hour Hourly Forecast Timeline */}
      <div className="glass-panel lg:col-span-2 rounded-2xl p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-cyan-400" />
              12-Hour Rain Forecast & Timeline
            </h3>
            <p className="text-xs text-slate-400">Precipitation probability & volume expected hour by hour</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Max Rain: {weather.forecast12h.totalRainMm} mm
          </span>
        </div>

        {/* Hourly Cards Scroll */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {weather.forecast12h.hourly.map((h, idx) => {
            const isHighRain = h.rainProb >= 50;
            return (
              <div
                key={idx}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border w-24 text-center transition-all ${
                  isHighRain
                    ? "bg-gradient-to-b from-cyan-950/60 to-blue-900/40 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                    : "bg-slate-900/50 border-slate-800"
                }`}
              >
                <span className="text-xs font-medium text-slate-400 mb-1">{h.hourLabel}</span>
                <div className="my-1.5">{renderWeatherIcon(h.weatherCode, "w-6 h-6")}</div>
                <span className="text-sm font-bold text-slate-100">{Math.round(h.temp)}°C</span>
                <div className="mt-2 w-full">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Rain</span>
                    <span className={`font-semibold ${isHighRain ? "text-cyan-300" : "text-slate-300"}`}>
                      {h.rainProb}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHighRain ? "bg-cyan-400" : h.rainProb > 20 ? "bg-sky-500" : "bg-slate-600"
                      }`}
                      style={{ width: `${Math.max(5, h.rainProb)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5-Day Forecast Snapshot */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">5-Day Outlook:</span>
          <div className="flex gap-4">
            {weather.daily.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-slate-300 font-medium">{d.dayName}:</span>
                <span className="text-slate-100 font-bold">{d.tempMax}°</span>
                <span className="text-cyan-400 text-[11px]">({d.rainProbMax}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
