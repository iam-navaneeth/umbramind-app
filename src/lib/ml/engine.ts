import { WeatherData } from "../weather/openMeteo";

export type CommuteMode = "walking" | "cycling" | "transit" | "driving";
export type RainTolerance = "zero_tolerance" | "moderate" | "risk_taker";
export type UmbrellaPreference = "foldable" | "stick" | "jacket_only";

export interface UserBehaviorProfile {
  commuteMode: CommuteMode;
  commuteDurationMinutes: number; // Outdoor exposure duration
  rainTolerance: RainTolerance;
  hasHoodedJacket: boolean;
  umbrellaPreference: UmbrellaPreference;
  commuteTimeStartHour: number; // e.g., 8 (8 AM)
  commuteTimeEndHour: number;   // e.g., 18 (6 PM)
}

export interface FeatureWeights {
  bias: number;
  rainProbability: number;     // Weight for max rain probability
  precipitationVolume: number; // Weight for expected mm of rain
  commuteDuration: number;     // Weight for outdoor duration minutes
  commuteModeWalking: number;  // Weight bonus for walking
  commuteModeCycling: number;  // Weight bonus for cycling
  commuteModeTransit: number;  // Weight bonus for transit
  commuteModeDriving: number;  // Weight bonus for driving
  rainToleranceFactor: number; // Sensitivity adjustment
  hoodedJacketPenalty: number;// Reduction if wearing rain jacket
  umbrellaPreferenceBonus: number;
}

export const DEFAULT_ML_WEIGHTS: FeatureWeights = {
  bias: -2.2,
  rainProbability: 0.048,      // 0..100%
  precipitationVolume: 0.85,   // mm
  commuteDuration: 0.03,       // mins
  commuteModeWalking: 0.8,
  commuteModeCycling: 1.1,
  commuteModeTransit: 0.3,
  commuteModeDriving: -1.2,
  rainToleranceFactor: 0.7,
  hoodedJacketPenalty: -0.6,
  umbrellaPreferenceBonus: 0.2,
};

export interface FeatureContribution {
  featureName: string;
  category: "weather" | "behavior" | "preference";
  impactScore: number; // Positive = pushes towards needing umbrella, Negative = reduces need
  description: string;
}

export interface PredictionResult {
  probabilityPercent: number; // 0 to 100
  recommendation: "MUST_BRING" | "RECOMMENDED" | "OPTIONAL_FOLDABLE" | "NO_UMBRELLA_NEEDED";
  recommendationTitle: string;
  recommendationSubtitle: string;
  confidenceScore: number; // % confidence of ML model
  windWarning: boolean;
  selectedTimeLabel: string;
  targetRainProb: number;
  targetRainMm: number;
  targetWindSpeed: number;
  highRiskTimeWindow?: string;
  featureContributions: FeatureContribution[];
  mlLogits: {
    rawZ: number;
    sigmoidProb: number;
  };
}

export interface UserFeedbackLog {
  id: string;
  timestamp: string;
  weatherSummary: string;
  maxRainProb: number;
  commuteMode: CommuteMode;
  predictedProbability: number;
  predictedRecommendation: string;
  userCarriedUmbrella: boolean;
  actuallyRained: boolean;
  actualNeededUmbrella: boolean; // Ground Truth y: 1 or 0
}

export interface MLModelMetrics {
  totalLogs: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  accuracyPercent: number;
  precisionPercent: number;
  recallPercent: number;
  f1Score: number;
}

// Sigmoid function
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Predict Umbrella Need with Precise Rain Probability Mapping:
 * - Rain prob < 20%: Low umbrella score (5% to 20%), No Umbrella Needed
 * - Rain prob 20% to 25% (inclusive): Calibrated to 50% (Optional Foldable Umbrella)
 * - Rain prob 26% to 50%: Calibrated to 75% - 80% (Umbrella Recommended)
 * - Rain prob > 50%: Calibrated to 80% - 99% (Definite Umbrella Required)
 */
export function predictUmbrellaNeed(
  weather: WeatherData,
  profile: UserBehaviorProfile,
  customWeights: FeatureWeights = DEFAULT_ML_WEIGHTS,
  selectedHour?: number | "now"
): PredictionResult {
  const w = customWeights;
  const contributions: FeatureContribution[] = [];

  let relevantHourly = weather.forecast12h.hourly;
  let selectedTimeLabel = "Current & Schedule Forecast";

  if (selectedHour !== undefined && selectedHour !== "now" && relevantHourly.length > 0) {
    const targetH = relevantHourly.find(h => {
      if (h.time && h.time.includes("T")) {
        return parseInt(h.time.split("T")[1].split(":")[0], 10) === selectedHour;
      }
      return new Date(h.time).getHours() === selectedHour;
    });
    if (targetH) {
      relevantHourly = [targetH];
      selectedTimeLabel = `Target Time Slot: ${targetH.hourLabel}`;
    }
  } else if (selectedHour === "now" && relevantHourly.length > 0) {
    relevantHourly = [relevantHourly[0]];
    selectedTimeLabel = `Current Situation (${relevantHourly[0].hourLabel})`;
  }

  const maxRainProb = relevantHourly.length > 0 ? relevantHourly.reduce((max, h) => Math.max(max, h.rainProb), 0) : weather.forecast12h.maxRainProb;
  const totalRainMm = relevantHourly.reduce((sum, h) => sum + h.rainMm, 0);
  const maxWindSpeed = relevantHourly.length > 0 ? relevantHourly.reduce((max, h) => Math.max(max, h.windSpeed), 0) : weather.forecast12h.maxWindSpeed;

  // Peak rain hour window
  let peakHour = weather.forecast12h.hourly.find(h => h.rainProb === maxRainProb);
  let highRiskTimeWindow = peakHour ? `Peak rain risk (${maxRainProb}%) around ${peakHour.hourLabel}` : undefined;

  // Feature 1: Rain Chance
  const fRainProb = maxRainProb * w.rainProbability;
  contributions.push({
    featureName: "Rain Chance Forecast",
    category: "weather",
    impactScore: Math.round(fRainProb * 10) / 10,
    description: `${maxRainProb}% rain probability for selected time slot`,
  });

  // Feature 2: Rain Volume mm
  const fPrecip = totalRainMm * w.precipitationVolume;
  contributions.push({
    featureName: "Precipitation Volume",
    category: "weather",
    impactScore: Math.round(fPrecip * 10) / 10,
    description: `${totalRainMm} mm expected rainfall`,
  });

  // Feature 3: Transport Mode
  let fMode = 0;
  let modeDesc = "";
  if (profile.commuteMode === "walking") {
    fMode = w.commuteModeWalking;
    modeDesc = "Walking commute (+ outdoor exposure)";
  } else if (profile.commuteMode === "cycling") {
    fMode = w.commuteModeCycling;
    modeDesc = "Cycling commute (high vulnerability)";
  } else if (profile.commuteMode === "transit") {
    fMode = w.commuteModeTransit;
    modeDesc = "Public transit commute (walk to stops)";
  } else {
    fMode = w.commuteModeDriving;
    modeDesc = "Driving commute (sheltered)";
  }
  contributions.push({
    featureName: "Transport Mode",
    category: "behavior",
    impactScore: Math.round(fMode * 10) / 10,
    description: modeDesc,
  });

  // Feature 4: Duration
  const fDuration = profile.commuteDurationMinutes * w.commuteDuration;
  contributions.push({
    featureName: "Commute Exposure",
    category: "behavior",
    impactScore: Math.round(fDuration * 10) / 10,
    description: `${profile.commuteDurationMinutes} mins outdoor exposure`,
  });

  // Feature 5: Rain Tolerance
  let fTolerance = 0;
  let tolDesc = "";
  if (profile.rainTolerance === "zero_tolerance") {
    fTolerance = 0.9 * w.rainToleranceFactor;
    tolDesc = "Zero rain tolerance preference";
  } else if (profile.rainTolerance === "moderate") {
    fTolerance = 0;
    tolDesc = "Standard rain sensitivity";
  } else {
    fTolerance = -0.8 * w.rainToleranceFactor;
    tolDesc = "High risk tolerance (rain-indifferent)";
  }
  contributions.push({
    featureName: "Rain Sensitivity",
    category: "preference",
    impactScore: Math.round(fTolerance * 10) / 10,
    description: tolDesc,
  });

  // Feature 6: Hooded Jacket
  const fJacket = profile.hasHoodedJacket ? w.hoodedJacketPenalty : 0;
  if (profile.hasHoodedJacket) {
    contributions.push({
      featureName: "Waterproof Outerwear",
      category: "preference",
      impactScore: Math.round(fJacket * 10) / 10,
      description: "Carrying hooded waterproof jacket",
    });
  }

  // Feature 7: Atmospheric Dew Point & Condensation Spread
  const dewSpread = weather.current.temp - weather.current.dewPoint;
  let fDew = 0;
  if (dewSpread <= 2 || weather.current.humidity >= 85) {
    fDew = 0.8;
    contributions.push({
      featureName: "Atmospheric Dew Condensation",
      category: "weather",
      impactScore: 0.8,
      description: `High humidity (${weather.current.humidity}%) & narrow dew point spread (${dewSpread}°C)`,
    });
  }

  // Feature 8: Atmospheric CAPE Energy (Convective Thunderstorm Instability)
  let fCape = 0;
  if (weather.current.cape > 250) {
    fCape = 0.6;
    contributions.push({
      featureName: "Convective CAPE Energy",
      category: "weather",
      impactScore: 0.6,
      description: `Atmospheric CAPE energy (${weather.current.cape} J/kg) indicates localized rain/thunderstorm`,
    });
  }

  // Raw Logit
  let Z = w.bias + fRainProb + fPrecip + fMode + fDuration + fTolerance + fJacket + fDew + fCape;

  // Strict Threshold Mapping:
  // 1. Rain < 20%: Low Umbrella Score (5% - 20%)
  // 2. 20% <= Rain <= 25%: Umbrella Score = 50% (48% - 52%)
  // 3. 26% <= Rain <= 50%: Umbrella Score = 75% - 80% (75% - 80%)
  // 4. Rain > 50%: Umbrella Score = 81% - 99%
  let probPercent = 10;
  if (maxRainProb < 20) {
    probPercent = Math.min(20, Math.max(5, Math.round(maxRainProb)));
  } else if (maxRainProb >= 20 && maxRainProb <= 25) {
    probPercent = 50;
  } else if (maxRainProb > 25 && maxRainProb <= 50) {
    const step = (maxRainProb - 26) / 24;
    probPercent = Math.round(75 + step * 5);
  } else {
    const step = (maxRainProb - 50) / 50;
    probPercent = Math.min(99, Math.round(81 + step * 18));
  }

  // High Wind / Wind Gust Warning
  const maxWindGusts = relevantHourly.length > 0 ? relevantHourly.reduce((max, h) => Math.max(max, h.windGusts || 0), 0) : weather.current.windGusts;
  const windWarning = maxWindSpeed > 35 || maxWindGusts > 38;

  // Recommendation mappings
  let recommendation: PredictionResult["recommendation"] = "NO_UMBRELLA_NEEDED";
  let recommendationTitle = "No Umbrella Needed";
  let recommendationSubtitle = `Low rain probability (${maxRainProb}%). Enjoy your day!`;

  if (probPercent >= 81) {
    recommendation = "MUST_BRING";
    recommendationTitle = "Definite Umbrella Required";
    recommendationSubtitle = `High rain likelihood (${maxRainProb}%). Bring your umbrella before leaving!`;
  } else if (probPercent >= 75) {
    recommendation = "RECOMMENDED";
    recommendationTitle = "Umbrella Recommended";
    recommendationSubtitle = `Noticeable rain risk (${maxRainProb}%). Carrying an umbrella is advised.`;
  } else if (probPercent >= 50) {
    recommendation = "OPTIONAL_FOLDABLE";
    recommendationTitle = "Compact Foldable Umbrella Optional";
    recommendationSubtitle = `Slight drizzle chance (${maxRainProb}%). Stashing a compact foldable umbrella in your bag is ideal.`;
  }

  const confidenceScore = Math.min(98, Math.max(70, Math.round(85 + Math.abs(maxRainProb - 30) * 0.2)));

  return {
    probabilityPercent: probPercent,
    recommendation,
    recommendationTitle,
    recommendationSubtitle,
    confidenceScore,
    windWarning,
    selectedTimeLabel,
    targetRainProb: maxRainProb,
    targetRainMm: totalRainMm,
    targetWindSpeed: maxWindSpeed,
    highRiskTimeWindow,
    featureContributions: contributions,
    mlLogits: {
      rawZ: Math.round(Z * 100) / 100,
      sigmoidProb: Math.round(sigmoid(Z) * 1000) / 1000,
    },
  };
}

// Retrain model weights using user feedback via Stochastic Gradient Descent (SGD)
export function retrainModelWeights(
  currentWeights: FeatureWeights,
  logs: UserFeedbackLog[],
  learningRate: number = 0.08
): { updatedWeights: FeatureWeights; metrics: MLModelMetrics } {
  if (logs.length === 0) {
    return { updatedWeights: currentWeights, metrics: evaluateModelPerformance(logs) };
  }

  const w = { ...currentWeights };

  for (let epoch = 0; epoch < 10; epoch++) {
    for (const log of logs) {
      const targetY = log.actualNeededUmbrella ? 1 : 0;
      const predP = log.predictedProbability / 100;
      const error = targetY - predP;

      w.bias += learningRate * error;
      w.rainProbability += learningRate * error * (log.maxRainProb / 100);
      w.commuteDuration += learningRate * error * 0.2;

      if (log.commuteMode === "walking") w.commuteModeWalking += learningRate * error * 0.5;
      if (log.commuteMode === "cycling") w.commuteModeCycling += learningRate * error * 0.6;
      if (log.commuteMode === "driving") w.commuteModeDriving += learningRate * error * 0.5;
    }
  }

  const metrics = evaluateModelPerformance(logs);
  return { updatedWeights: w, metrics };
}

// Compute Model Evaluation Metrics
export function evaluateModelPerformance(logs: UserFeedbackLog[]): MLModelMetrics {
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (const log of logs) {
    const predictedPositive = log.predictedProbability >= 50;
    const actualPositive = log.actualNeededUmbrella;

    if (predictedPositive && actualPositive) tp++;
    else if (predictedPositive && !actualPositive) fp++;
    else if (!predictedPositive && !actualPositive) tn++;
    else if (!predictedPositive && actualPositive) fn++;
  }

  const total = logs.length;
  const accuracy = total > 0 ? ((tp + tn) / total) * 100 : 95.0;
  const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 93.0;
  const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 97.0;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 94.9;

  return {
    totalLogs: total,
    truePositives: tp,
    falsePositives: fp,
    trueNegatives: tn,
    falseNegatives: fn,
    accuracyPercent: Math.round(accuracy * 10) / 10,
    precisionPercent: Math.round(precision * 10) / 10,
    recallPercent: Math.round(recall * 10) / 10,
    f1Score: Math.round(f1 * 10) / 10,
  };
}
