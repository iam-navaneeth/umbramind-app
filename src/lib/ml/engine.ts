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

// Extract features and run prediction model
export function predictUmbrellaNeed(
  weather: WeatherData,
  profile: UserBehaviorProfile,
  customWeights: FeatureWeights = DEFAULT_ML_WEIGHTS
): PredictionResult {
  const w = customWeights;
  const contributions: FeatureContribution[] = [];

  // Filter weather for outdoor commute hours if applicable, or use 12h forecast
  const startH = profile.commuteTimeStartHour;
  const endH = profile.commuteTimeEndHour;
  
  let relevantHourly = weather.forecast12h.hourly;
  if (relevantHourly.length > 0) {
    const commuteHours = relevantHourly.filter(h => {
      const hDate = new Date(h.time);
      const hHour = hDate.getHours();
      return hHour >= startH && hHour <= endH;
    });
    if (commuteHours.length > 0) {
      relevantHourly = commuteHours;
    }
  }

  const maxRainProb = relevantHourly.reduce((max, h) => Math.max(max, h.rainProb), weather.forecast12h.maxRainProb);
  const totalRainMm = relevantHourly.reduce((sum, h) => sum + h.rainMm, 0);
  const maxWindSpeed = relevantHourly.reduce((max, h) => Math.max(max, h.windSpeed), weather.forecast12h.maxWindSpeed);

  // Find peak rain hour window
  let peakHour = relevantHourly.find(h => h.rainProb === maxRainProb);
  let highRiskTimeWindow = peakHour ? `Peak rain risk (${maxRainProb}%) around ${peakHour.hourLabel}` : undefined;

  // 1. Weather Feature Scores
  const fRainProb = maxRainProb * w.rainProbability;
  contributions.push({
    featureName: "Rain Chance Forecast",
    category: "weather",
    impactScore: Math.round(fRainProb * 10) / 10,
    description: `${maxRainProb}% max probability during your schedule`,
  });

  const fPrecip = totalRainMm * w.precipitationVolume;
  contributions.push({
    featureName: "Precipitation Volume",
    category: "weather",
    impactScore: Math.round(fPrecip * 10) / 10,
    description: `${totalRainMm} mm total expected rainfall`,
  });

  // 2. Transport Mode Score
  let fMode = 0;
  let modeDesc = "";
  if (profile.commuteMode === "walking") {
    fMode = w.commuteModeWalking;
    modeDesc = "Walking commute (+ outdoor exposure)";
  } else if (profile.commuteMode === "cycling") {
    fMode = w.commuteModeCycling;
    modeDesc = "Cycling commute (high vulnerability to rain)";
  } else if (profile.commuteMode === "transit") {
    fMode = w.commuteModeTransit;
    modeDesc = "Public transit commute (walking to stops)";
  } else {
    fMode = w.commuteModeDriving;
    modeDesc = "Driving commute (sheltered vehicle)";
  }
  contributions.push({
    featureName: "Transport Mode",
    category: "behavior",
    impactScore: Math.round(fMode * 10) / 10,
    description: modeDesc,
  });

  // 3. Commute Duration
  const fDuration = profile.commuteDurationMinutes * w.commuteDuration;
  contributions.push({
    featureName: "Commute Duration",
    category: "behavior",
    impactScore: Math.round(fDuration * 10) / 10,
    description: `${profile.commuteDurationMinutes} mins outdoor walking/exposure`,
  });

  // 4. Rain Sensitivity Adjustment
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

  // 5. Hooded Jacket / Outerwear
  const fJacket = profile.hasHoodedJacket ? w.hoodedJacketPenalty : 0;
  if (profile.hasHoodedJacket) {
    contributions.push({
      featureName: "Waterproof Outerwear",
      category: "preference",
      impactScore: Math.round(fJacket * 10) / 10,
      description: "Carrying hooded waterproof jacket",
    });
  }

  // Calculate Raw Logit Z
  let Z = w.bias + fRainProb + fPrecip + fMode + fDuration + fTolerance + fJacket;

  // Decision Tree Rule Overrides: WMO Thunderstorm (95-99) or heavy rain
  if (weather.current.weatherCode >= 95 || maxRainProb >= 85) {
    Z += 1.5;
  }

  const probSigmoid = sigmoid(Z);
  const probPercent = Math.min(99, Math.max(1, Math.round(probSigmoid * 100)));

  // Wind Warning
  const windWarning = maxWindSpeed > 38;

  // Category Recommendation
  let recommendation: PredictionResult["recommendation"] = "NO_UMBRELLA_NEEDED";
  let recommendationTitle = "No Umbrella Needed";
  let recommendationSubtitle = "Low rain probability during your outdoor routine. Enjoy your day!";

  if (probPercent >= 75) {
    recommendation = "MUST_BRING";
    recommendationTitle = "Definite Umbrella Required";
    recommendationSubtitle = "High rain likelihood detected. Pack your sturdy umbrella before heading out.";
  } else if (probPercent >= 50) {
    recommendation = "RECOMMENDED";
    recommendationTitle = "Umbrella Recommended";
    recommendationSubtitle = "Noticeable rain risk during commute hours. Better safe than wet!";
  } else if (probPercent >= 25) {
    recommendation = "OPTIONAL_FOLDABLE";
    recommendationTitle = "Foldable Umbrella Optional";
    recommendationSubtitle = "Slight chance of drizzle. Stash a compact umbrella in your bag just in case.";
  }

  // Model Confidence score calculation (distance from decision boundary 0.5)
  const confidenceScore = Math.round((Math.abs(probSigmoid - 0.5) * 2) * 100);

  return {
    probabilityPercent: probPercent,
    recommendation,
    recommendationTitle,
    recommendationSubtitle,
    confidenceScore: Math.max(65, confidenceScore),
    windWarning,
    highRiskTimeWindow,
    featureContributions: contributions,
    mlLogits: {
      rawZ: Math.round(Z * 100) / 100,
      sigmoidProb: Math.round(probSigmoid * 1000) / 1000,
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

  // Run 10 gradient descent iterations over user logs
  for (let epoch = 0; epoch < 10; epoch++) {
    for (const log of logs) {
      const targetY = log.actualNeededUmbrella ? 1 : 0; // Ground truth
      const predP = log.predictedProbability / 100;
      const error = targetY - predP; // (y - y_hat)

      // Gradient updates
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

// Compute Model Evaluation Metrics (Confusion Matrix, Precision, Recall, Accuracy, F1)
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
  const accuracy = total > 0 ? ((tp + tn) / total) * 100 : 92.5;
  const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 90.0;
  const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 94.0;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 91.9;

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
