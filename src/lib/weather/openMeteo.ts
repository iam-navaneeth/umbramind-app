export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  current: {
    temp: number;
    weatherCode: number;
    conditionText: string;
    windSpeed: number;
    humidity: number;
    cloudCover: number;
  };
  forecast12h: {
    maxRainProb: number;
    totalRainMm: number;
    maxWindSpeed: number;
    avgCloudCover: number;
    hourly: Array<{
      time: string;
      hourLabel: string;
      temp: number;
      rainProb: number;
      rainMm: number;
      windSpeed: number;
      weatherCode: number;
    }>;
  };
  daily: Array<{
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    rainProbMax: number;
    rainSumMm: number;
    weatherCode: number;
  }>;
}

export interface GeocodingResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
}

// Map WMO weather codes to readable descriptions and category
export function getWeatherCondition(code: number): { text: string; category: "clear" | "cloudy" | "drizzle" | "rain" | "thunderstorm" | "snow" } {
  if (code === 0) return { text: "Clear Sky", category: "clear" };
  if (code >= 1 && code <= 3) return { text: "Partly Cloudy", category: "cloudy" };
  if (code >= 45 && code <= 48) return { text: "Foggy & Misty", category: "cloudy" };
  if (code >= 51 && code <= 57) return { text: "Light Drizzle", category: "drizzle" };
  if (code >= 61 && code <= 65) return { text: "Rain Showers", category: "rain" };
  if (code >= 66 && code <= 67) return { text: "Freezing Rain", category: "rain" };
  if (code >= 71 && code <= 77) return { text: "Snowfall", category: "snow" };
  if (code >= 80 && code <= 82) return { text: "Heavy Rain Showers", category: "rain" };
  if (code >= 85 && code <= 86) return { text: "Snow Showers", category: "snow" };
  if (code >= 95 && code <= 99) return { text: "Thunderstorm & Rain", category: "thunderstorm" };
  return { text: "Variable Weather", category: "cloudy" };
}

// Search location by city name
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to search location");
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map((r: any) => ({
      name: r.name,
      country: r.country || "",
      latitude: r.latitude,
      longitude: r.longitude,
      admin1: r.admin1 || "",
    }));
  } catch (err) {
    console.error("Geocoding error:", err);
    return [];
  }
}

// Fetch complete weather forecast for given coords
export async function fetchWeatherData(lat: number, lon: number, locationName?: string, countryName?: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data from Open-Meteo");
  const data = await res.json();

  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  // Extract next 12 hours forecast
  const now = new Date();
  const currentHour = now.getHours();
  const next12Hours: WeatherData["forecast12h"]["hourly"] = [];

  let maxRainProb = 0;
  let totalRainMm = 0;
  let maxWindSpeed = 0;
  let sumCloudCover = 0;

  const totalPoints = Math.min(12, hourly.time.length - currentHour);
  for (let i = currentHour; i < currentHour + totalPoints; i++) {
    const timeStr = hourly.time[i];
    const hourDate = new Date(timeStr);
    const hourLabel = hourDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const rainProb = hourly.precipitation_probability[i] || 0;
    const rainMm = hourly.precipitation[i] || 0;
    const windSpeed = hourly.wind_speed_10m[i] || 0;
    const temp = hourly.temperature_2m[i] || 0;
    const weatherCode = hourly.weather_code[i] || 0;

    if (rainProb > maxRainProb) maxRainProb = rainProb;
    totalRainMm += rainMm;
    if (windSpeed > maxWindSpeed) maxWindSpeed = windSpeed;

    next12Hours.push({
      time: timeStr,
      hourLabel,
      temp,
      rainProb,
      rainMm,
      windSpeed,
      weatherCode,
    });
  }

  // Next 5 days forecast
  const dailyList: WeatherData["daily"] = [];
  if (daily && daily.time) {
    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
      const dDate = new Date(daily.time[i]);
      const dayName = i === 0 ? "Today" : dDate.toLocaleDateString([], { weekday: 'short' });
      dailyList.push({
        date: daily.time[i],
        dayName,
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        rainProbMax: daily.precipitation_probability_max[i] || 0,
        rainSumMm: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
        weatherCode: daily.weather_code[i] || 0,
      });
    }
  }

  const cond = getWeatherCondition(current.weather_code);

  return {
    city: locationName || "Your Location",
    country: countryName || "",
    latitude: lat,
    longitude: lon,
    current: {
      temp: Math.round(current.temperature_2m),
      weatherCode: current.weather_code,
      conditionText: cond.text,
      windSpeed: Math.round(current.wind_speed_10m),
      humidity: current.relative_humidity_2m,
      cloudCover: current.cloud_cover,
    },
    forecast12h: {
      maxRainProb,
      totalRainMm: Math.round(totalRainMm * 10) / 10,
      maxWindSpeed: Math.round(maxWindSpeed),
      avgCloudCover: Math.round(current.cloud_cover),
      hourly: next12Hours,
    },
    daily: dailyList,
  };
}
