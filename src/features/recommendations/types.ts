import type { DbHostel } from "@/hooks/useHostels";

export type Importance = 1 | 2 | 3 | 4 | 5;

export interface StudentPreference {
  id?: string;
  student_id: string;
  budget_min: number;
  budget_max: number;
  preferred_distance_km: number;
  preferred_location?: string | null;
  preferred_lat?: number | null;
  preferred_lng?: number | null;
  preferred_radius_km: number;
  room_type: "single" | "double" | "triple" | "any";
  food_preference: "veg" | "non-veg" | "any";
  wifi_required: boolean;
  laundry_required: boolean;
  parking_required: boolean;
  study_environment: "quiet" | "social" | "any";
  gender_preference: "boys" | "girls" | "co-ed" | "any";
  sharing_preference: "private" | "shared" | "any";
  importance_safety: Importance;
  importance_budget: Importance;
  importance_distance: Importance;
  importance_facility: Importance;
}

export interface HostelSafetyScore {
  hostel_id: string;
  has_cctv: boolean;
  has_security_guard: boolean;
  has_fire_safety: boolean;
  nearby_hospital: boolean;
  nearby_police: boolean;
  score: number;
  level: "excellent" | "good" | "average" | "poor";
}

export interface OwnerTrustScore {
  owner_id: string;
  verified: boolean;
  avg_rating: number;
  complaints_count: number;
  bookings_completed: number;
  response_minutes: number;
  months_on_platform: number;
  score: number;
}

export interface SubScores {
  budget: number;
  distance: number;
  facility: number;
  safety: number;
  food: number;
  internet: number;
  trust: number;
  rating: number;
  availability: number;
  verified: number;
  popularity: number;
}

export interface Weights extends SubScores {}

export interface Explanation {
  reasons: string[];
  bestFor: string[];
  matches: Partial<Record<keyof SubScores, string>>;
}

export interface ScoredHostel {
  hostel: DbHostel;
  overall: number; // 0..100
  confidence: number; // 0..1
  subScores: SubScores;
  weights: Weights;
  explanation: Explanation;
  safety?: HostelSafetyScore;
  trust?: OwnerTrustScore;
  /** Real great-circle distance from the student's preferred location (km), when known. */
  distanceKm?: number | null;
  /** Estimated travel times in minutes, derived from the real distance. */
  eta?: { walk: number; bike: number; car: number; transit: number } | null;
}

export interface EngineResult {
  items: ScoredHostel[];
  /** Radius actually used after automatic expansion (km). Null when no preferred location is pinned. */
  appliedRadiusKm: number | null;
  expanded: boolean;
}

export const DEFAULT_PREFERENCE: Omit<StudentPreference, "student_id"> = {
  budget_min: 0,
  budget_max: 20000,
  preferred_distance_km: 5,
  preferred_location: null,
  preferred_lat: null,
  preferred_lng: null,
  preferred_radius_km: 50,
  room_type: "any",
  food_preference: "any",
  wifi_required: false,
  laundry_required: false,
  parking_required: false,
  study_environment: "any",
  gender_preference: "any",
  sharing_preference: "any",
  importance_safety: 3,
  importance_budget: 3,
  importance_distance: 3,
  importance_facility: 3,
};