import { UserBehaviorProfile, FeatureWeights, DEFAULT_ML_WEIGHTS, UserFeedbackLog } from "../ml/engine";

const PROFILE_KEY = "umbramind_user_profile";
const WEIGHTS_KEY = "umbramind_ml_weights";
const LOGS_KEY = "umbramind_history_logs";

export const DEFAULT_USER_PROFILE: UserBehaviorProfile = {
  commuteMode: "walking",
  commuteDurationMinutes: 20,
  rainTolerance: "moderate",
  hasHoodedJacket: false,
  umbrellaPreference: "foldable",
  commuteTimeStartHour: 8,
  commuteTimeEndHour: 18,
};

// Synthetic default seed logs for immediate interactive model evaluation
export const INITIAL_SEED_LOGS: UserFeedbackLog[] = [
  {
    id: "log-1",
    timestamp: "2026-09-15 08:30",
    weatherSummary: "Heavy Showers (78% Rain)",
    maxRainProb: 78,
    commuteMode: "walking",
    predictedProbability: 88,
    predictedRecommendation: "MUST_BRING",
    userCarriedUmbrella: true,
    actuallyRained: true,
    actualNeededUmbrella: true,
  },
  {
    id: "log-2",
    timestamp: "2026-09-14 09:00",
    weatherSummary: "Clear Skies (5% Rain)",
    maxRainProb: 5,
    commuteMode: "driving",
    predictedProbability: 8,
    predictedRecommendation: "NO_UMBRELLA_NEEDED",
    userCarriedUmbrella: false,
    actuallyRained: false,
    actualNeededUmbrella: false,
  },
  {
    id: "log-3",
    timestamp: "2026-09-13 17:15",
    weatherSummary: "Light Drizzle (42% Rain)",
    maxRainProb: 42,
    commuteMode: "walking",
    predictedProbability: 58,
    predictedRecommendation: "RECOMMENDED",
    userCarriedUmbrella: true,
    actuallyRained: true,
    actualNeededUmbrella: true,
  },
  {
    id: "log-4",
    timestamp: "2026-09-12 08:15",
    weatherSummary: "Partly Cloudy (20% Rain)",
    maxRainProb: 20,
    commuteMode: "cycling",
    predictedProbability: 46,
    predictedRecommendation: "OPTIONAL_FOLDABLE",
    userCarriedUmbrella: true,
    actuallyRained: false,
    actualNeededUmbrella: false,
  },
  {
    id: "log-5",
    timestamp: "2026-09-11 18:00",
    weatherSummary: "Thunderstorm (92% Rain)",
    maxRainProb: 92,
    commuteMode: "transit",
    predictedProbability: 95,
    predictedRecommendation: "MUST_BRING",
    userCarriedUmbrella: true,
    actuallyRained: true,
    actualNeededUmbrella: true,
  },
];

export function getStoredProfile(): UserBehaviorProfile {
  if (typeof window === "undefined") return DEFAULT_USER_PROFILE;
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserBehaviorProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile:", err);
  }
}

export function getStoredWeights(): FeatureWeights {
  if (typeof window === "undefined") return DEFAULT_ML_WEIGHTS;
  try {
    const data = localStorage.getItem(WEIGHTS_KEY);
    return data ? JSON.parse(data) : DEFAULT_ML_WEIGHTS;
  } catch {
    return DEFAULT_ML_WEIGHTS;
  }
}

export function saveStoredWeights(weights: FeatureWeights): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
  } catch (err) {
    console.error("Failed to save weights:", err);
  }
}

export function getStoredLogs(): UserFeedbackLog[] {
  if (typeof window === "undefined") return INITIAL_SEED_LOGS;
  try {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : INITIAL_SEED_LOGS;
  } catch {
    return INITIAL_SEED_LOGS;
  }
}

export function saveStoredLogs(logs: UserFeedbackLog[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error("Failed to save logs:", err);
  }
}
