/**
 * Shared domain types for CruceEP.
 *
 * These types are intentionally provider-agnostic: every data adapter (border
 * waits, transit, weather, alerts, cooling centers) returns these shapes so the
 * UI never depends on a specific upstream source.
 */

export type Locale = "en" | "es";

/**
 * Confidence/status badge shown on every dynamic data card so users always know
 * how much to trust a value. Never render mock data without one of these.
 */
export type DataConfidence =
  | "live" // fetched from an official live source just now
  | "cached" // previously fetched, served from cache
  | "estimated" // derived/predicted, not an official measurement
  | "mock" // sample/demo data, not real
  | "unavailable"; // source could not be reached

/** Source attribution attached to every dynamic value. */
export interface SourceAttribution {
  /** Human-readable source name, e.g. "CBP Border Wait Times". */
  source: string;
  /** Link to the official source, when one exists. */
  sourceUrl?: string;
  /** ISO timestamp of when the underlying data was observed/updated. */
  lastUpdated: string;
  /** Trust level for this value. */
  confidence: DataConfidence;
}

// ---------------------------------------------------------------------------
// Bridges / border wait times
// ---------------------------------------------------------------------------

export type CrossingMode = "vehicle" | "pedestrian" | "ready_lane" | "sentri" | "fast";
export type CrossingDirection = "northbound" | "southbound";

export interface Bridge {
  id: string;
  name: string;
  alternateNames: string[];
  city: string;
  /** e.g. "US-MX". */
  countryPair: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface BridgeWaitLane {
  mode: CrossingMode;
  laneType?: string;
  /** null when the lane is closed or wait is unknown. */
  waitMinutes: number | null;
  /** e.g. "open", "closed", "delay". */
  status: string;
}

export interface BridgeWait {
  bridgeId: string;
  bridgeName: string;
  direction: CrossingDirection;
  lanes: BridgeWaitLane[];
  attribution: SourceAttribution;
}

// ---------------------------------------------------------------------------
// Transit / trip planning
// ---------------------------------------------------------------------------

export type TripType = "local" | "cross_border" | "transit" | "heat_safe";
export type PreferredMode = "driving" | "walking" | "sun_metro" | "eta" | "mixed";
export type DepartureWhen = "now" | "later";

export interface TripRequest {
  origin: string;
  destination: string;
  tripType: TripType;
  preferredMode: PreferredMode;
  when: DepartureWhen;
  /** ISO time string when `when === "later"`. */
  departAt?: string;
}

export interface TransitLeg {
  /** e.g. "walk", "bus", "brt", "drive", "border". */
  kind: "walk" | "bus" | "brt" | "drive" | "border" | "wait";
  /** Short bilingual-ready label key or literal text. */
  label: string;
  durationMinutes: number;
  /** Route/line identifier when applicable, e.g. "Sun Metro 24". */
  line?: string;
}

export interface TripPlan {
  request: TripRequest;
  legs: TransitLeg[];
  totalMinutes: number;
  /** Suggested bridge id when crossing the border. */
  suggestedBridgeId?: string;
  suggestedBridgeName?: string;
  estimatedBridgeWaitMinutes?: number;
  attribution: SourceAttribution;
  /** True while route engines are placeholder/beta. */
  beta: boolean;
}

// ---------------------------------------------------------------------------
// Weather / heat
// ---------------------------------------------------------------------------

export type HeatCaution = "low" | "moderate" | "high" | "extreme";

export interface WeatherSnapshot {
  temperatureF: number;
  feelsLikeF: number;
  conditions: string;
  /** Whether an official heat advisory is in effect. */
  advisory: boolean;
  caution: HeatCaution;
  /** Short bilingual reminder keys resolved by the UI. */
  attribution: SourceAttribution;
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export type AlertCategory =
  | "sun_metro"
  | "eta"
  | "bridge"
  | "weather"
  | "cooling_center"
  | "city";
export type AlertSeverity = "info" | "minor" | "major" | "severe";

export interface ServiceAlert {
  id: string;
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
  category: AlertCategory;
  severity: AlertSeverity;
  affectedArea?: string;
  source: string;
  sourceUrl?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  lastUpdated: string;
  confidence: DataConfidence;
}

// ---------------------------------------------------------------------------
// Cooling centers / safe places
// ---------------------------------------------------------------------------

export type CoolingCenterType =
  | "cooling_center"
  | "library"
  | "public_facility"
  | "shelter"
  | "recreation_center";

export interface CoolingCenter {
  id: string;
  name: string;
  type: CoolingCenterType;
  address: string;
  phone?: string | null;
  website?: string | null;
  hoursEn?: string | null;
  hoursEs?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  source: string;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Saved routes
// ---------------------------------------------------------------------------

export interface SavedRoute {
  id: string;
  userId: string | null;
  name: string;
  origin: string;
  destination: string;
  tripType: TripType;
  preferredMode: PreferredMode;
  favoriteBridge?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Data source health (admin)
// ---------------------------------------------------------------------------

export interface DataSourceHealth {
  id: string;
  sourceName: string;
  status: "ok" | "degraded" | "down" | "mock";
  lastSuccessAt?: string | null;
  lastFailureAt?: string | null;
  lastError?: string | null;
  metadata?: Record<string, unknown>;
  updatedAt: string;
}

/** Standard envelope returned by API routes. */
export interface ApiResult<T> {
  data: T;
  attribution?: SourceAttribution;
  meta?: Record<string, unknown>;
}
