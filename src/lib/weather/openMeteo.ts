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
  type?: string;
}

// Local high-precision dictionary for Palakkad & Kerala villages and towns
const KERALA_PALAKKAD_PLACES: GeocodingResult[] = [
  { name: "Pallassana", country: "India", latitude: 10.6625, longitude: 76.6212, admin1: "Palakkad, Kerala" },
  { name: "Kollengode", country: "India", latitude: 10.6122, longitude: 76.6496, admin1: "Palakkad, Kerala" },
  { name: "Cheramangalam", country: "India", latitude: 10.7410, longitude: 76.5910, admin1: "Palakkad, Kerala" },
  { name: "Chembai (Cheramangalam)", country: "India", latitude: 10.7415, longitude: 76.5905, admin1: "Palakkad, Kerala" },
  { name: "Palakkad", country: "India", latitude: 10.7867, longitude: 76.6548, admin1: "Kerala" },
  { name: "Chittur", country: "India", latitude: 10.7011, longitude: 76.7381, admin1: "Palakkad, Kerala" },
  { name: "Alathur", country: "India", latitude: 10.6438, longitude: 76.5441, admin1: "Palakkad, Kerala" },
  { name: "Nenmara", country: "India", latitude: 10.5843, longitude: 76.5986, admin1: "Palakkad, Kerala" },
  { name: "Ottapalam", country: "India", latitude: 10.7709, longitude: 76.3768, admin1: "Palakkad, Kerala" },
  { name: "Pattambi", country: "India", latitude: 10.8092, longitude: 76.1812, admin1: "Palakkad, Kerala" },
  { name: "Kochi", country: "India", latitude: 9.9312, longitude: 76.2673, admin1: "Kerala" },
  { name: "Thiruvananthapuram", country: "India", latitude: 8.5241, longitude: 76.9366, admin1: "Kerala" },
  { name: "Kozhikode", country: "India", latitude: 11.2588, longitude: 75.7804, admin1: "Kerala" },
];

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

// Search location by city or village name across multiple geocoding services
export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const qLower = query.trim().toLowerCase();
  const matchedLocal = KERALA_PALAKKAD_PLACES.filter(p =>
    p.name.toLowerCase().includes(qLower) || (p.admin1 && p.admin1.toLowerCase().includes(qLower))
  );

  let results: GeocodingResult[] = [...matchedLocal];

  // Open-Meteo Geocoding API
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        data.results.forEach((r: any) => {
          // Avoid duplicate local entries
          if (!results.some(existing => Math.abs(existing.latitude - r.latitude) < 0.02 && Math.abs(existing.longitude - r.longitude) < 0.02)) {
            results.push({
              name: r.name,
              country: r.country || "",
              latitude: r.latitude,
              longitude: r.longitude,
              admin1: r.admin1 || r.admin2 || "",
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn("Open-Meteo geocoding search issue:", err);
  }

  // Fallback to OpenStreetMap Nominatim if fewer than 2 results found
  if (results.length < 2) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const res = await fetch(nomUrl, {
        headers: { "User-Agent": "UmberlaApp-WeatherAI/1.0" }
      });
      if (res.ok) {
        const nomData = await res.json();
        if (Array.isArray(nomData)) {
          nomData.forEach((item: any) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const addr = item.address || {};
            const placeName = addr.village || addr.town || addr.suburb || addr.city || item.display_name.split(",")[0];
            const countryName = addr.country || "India";
            const stateName = addr.state ? `${addr.state}${addr.county ? `, ${addr.county}` : ""}` : "";

            if (!results.some(existing => Math.abs(existing.latitude - lat) < 0.02 && Math.abs(existing.longitude - lon) < 0.02)) {
              results.push({
                name: placeName,
                country: countryName,
                latitude: lat,
                longitude: lon,
                admin1: stateName,
              });
            }
          });
        }
      }
    } catch (nomErr) {
      console.warn("Nominatim fallback search issue:", nomErr);
    }
  }

  return results.slice(0, 8);
}

// Reverse Geocoding to get real city/village name from GPS Lat/Lon
export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  // Check local database first for high precision
  const matchedLocal = KERALA_PALAKKAD_PLACES.find(p =>
    Math.abs(p.latitude - lat) < 0.04 && Math.abs(p.longitude - lon) < 0.04
  );
  if (matchedLocal) {
    return { name: matchedLocal.name, country: matchedLocal.admin1 ? `${matchedLocal.admin1}, ${matchedLocal.country}` : matchedLocal.country };
  }

  // BigDataCloud Free Reverse Geocoding API
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const placeName = data.locality || data.city || data.principalSubdivision || data.localityInfo?.informative?.[0]?.name;
      const countryName = data.countryName || "";
      if (placeName) {
        return { name: placeName, country: countryName };
      }
    }
  } catch (err) {
    console.warn("Reverse geocode BigDataCloud error:", err);
  }

  // OpenStreetMap Nominatim Reverse Geocoding API
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await fetch(nomUrl, {
      headers: { "User-Agent": "UmberlaApp-WeatherAI/1.0" }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const placeName = addr.village || addr.town || addr.suburb || addr.city || addr.county || "Detected Location";
      const countryName = addr.country || "";
      return { name: placeName, country: countryName };
    }
  } catch (err) {
    console.warn("Reverse geocode Nominatim error:", err);
  }

  return { name: "Detected Location", country: "" };
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

  // Extract next 12 hours forecast starting from CURRENT HOUR (using Open-Meteo's current.time)
  const currentTimeIso = current?.time || "";
  const next12Hours: WeatherData["forecast12h"]["hourly"] = [];

  let maxRainProb = 0;
  let totalRainMm = 0;
  let maxWindSpeed = 0;

  // Find matching start index in hourly.time array using current.time ISO string
  let startIndex = 0;
  if (hourly && hourly.time && Array.isArray(hourly.time)) {
    const matchIdx = hourly.time.findIndex((tStr: string) => tStr >= currentTimeIso);
    if (matchIdx !== -1) {
      startIndex = matchIdx;
    }
  }

  const totalPoints = Math.min(12, (hourly?.time?.length || 0) - startIndex);
  for (let i = startIndex; i < startIndex + totalPoints; i++) {
    const timeStr = hourly.time[i];
    
    // Format hour label robustly (e.g., "02:00 PM")
    let hourLabel = "";
    if (timeStr && timeStr.includes("T")) {
      const hNum = parseInt(timeStr.split("T")[1].split(":")[0], 10);
      const period = hNum >= 12 ? "PM" : "AM";
      const h12 = hNum % 12 === 0 ? 12 : hNum % 12;
      hourLabel = `${h12.toString().padStart(2, "0")}:00 ${period}`;
    } else {
      hourLabel = new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const rainProb = hourly.precipitation_probability ? (hourly.precipitation_probability[i] ?? 0) : 0;
    const rainMm = hourly.precipitation ? (hourly.precipitation[i] ?? 0) : 0;
    const windSpeed = hourly.wind_speed_10m ? (hourly.wind_speed_10m[i] ?? 0) : 0;
    const temp = hourly.temperature_2m ? (hourly.temperature_2m[i] ?? 0) : 0;
    const weatherCode = hourly.weather_code ? (hourly.weather_code[i] ?? 0) : 0;

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
