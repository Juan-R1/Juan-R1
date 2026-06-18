import type { HeatCaution, SourceAttribution, WeatherSnapshot } from "@/lib/types";

export interface WeatherProvider {
  readonly name: string;
  getCurrent(lat?: number, lon?: number): Promise<WeatherSnapshot>;
}

/** Map a temperature (°F) to a caution level used across the heat UI. */
export function heatCautionForTemp(feelsLikeF: number): HeatCaution {
  if (feelsLikeF >= 105) return "extreme";
  if (feelsLikeF >= 100) return "high";
  if (feelsLikeF >= 90) return "moderate";
  return "low";
}

/**
 * Deterministic mock weather. Temperature follows a daily curve so afternoons
 * read hotter than mornings — useful for demoing the heat-safe routing flow.
 */
export class MockWeatherProvider implements WeatherProvider {
  readonly name = "MockWeatherProvider";

  constructor(private readonly now: () => Date = () => new Date()) {}

  async getCurrent(): Promise<WeatherSnapshot> {
    const now = this.now();
    const hour = now.getHours();
    // Simple diurnal curve peaking ~4pm.
    const base = 78;
    const swing = 22 * Math.max(0, Math.cos(((hour - 16) / 24) * 2 * Math.PI));
    const temperatureF = Math.round(base + swing);
    const feelsLikeF = temperatureF + (temperatureF >= 95 ? 4 : 1);
    const caution = heatCautionForTemp(feelsLikeF);

    const attribution: SourceAttribution = {
      source: "National Weather Service (sample)",
      sourceUrl: "https://www.weather.gov/elp/",
      lastUpdated: now.toISOString(),
      confidence: "mock",
    };

    return {
      temperatureF,
      feelsLikeF,
      conditions: temperatureF >= 95 ? "Sunny and hot" : "Mostly sunny",
      advisory: caution === "extreme" || caution === "high",
      caution,
      attribution,
    };
  }
}

// ---------------------------------------------------------------------------
// Live National Weather Service provider (api.weather.gov, no API key required)
// ---------------------------------------------------------------------------

const C_TO_F = (c: number) => Math.round((c * 9) / 5 + 32);

export interface ParsedObservation {
  temperatureF: number;
  feelsLikeF: number;
  conditions: string;
  observedAt: string;
}

/** Pure parser for an NWS "latest observation" GeoJSON payload (unit-testable). */
export function parseNWSObservation(json: unknown): ParsedObservation | null {
  const props = (json as { properties?: Record<string, any> })?.properties;
  if (!props) return null;
  const tempC = props.temperature?.value;
  if (typeof tempC !== "number") return null;
  const temperatureF = C_TO_F(tempC);
  const heatIndexC = props.heatIndex?.value;
  const feelsLikeF =
    typeof heatIndexC === "number" ? C_TO_F(heatIndexC) : temperatureF;
  const conditions =
    typeof props.textDescription === "string" && props.textDescription
      ? props.textDescription
      : "—";
  const observedAt =
    typeof props.timestamp === "string"
      ? props.timestamp
      : new Date().toISOString();
  return { temperatureF, feelsLikeF, conditions, observedAt };
}

/** True when any active NWS alert is heat-related (advisory/warning). */
export function hasHeatAdvisory(alertsJson: unknown): boolean {
  const features = (alertsJson as { features?: any[] })?.features;
  if (!Array.isArray(features)) return false;
  return features.some((f) => {
    const event = String(f?.properties?.event ?? "").toLowerCase();
    return event.includes("heat");
  });
}

/**
 * Live weather from the National Weather Service. Keyless, but NWS requires a
 * descriptive User-Agent. Fetches the latest observation for an El Paso station
 * and (best-effort) active alerts to flag heat advisories. Throws on failure so
 * the caller (API route) can fall back to MockWeatherProvider with honest
 * "mock" labeling — we never present a failed fetch as "live".
 */
export class NWSWeatherProvider implements WeatherProvider {
  readonly name = "NWSWeatherProvider";

  constructor(
    private readonly station = process.env.NWS_STATION_ID || "KELP",
    private readonly point = "31.7587,-106.4869", // El Paso
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly timeoutMs = 5000
  ) {}

  private get headers() {
    return {
      // NWS API policy requires a self-identifying User-Agent.
      "User-Agent":
        process.env.NWS_USER_AGENT ||
        "CruceEP/1.0 (https://github.com/Juan-R1/Juan-R1)",
      Accept: "application/geo+json",
    };
  }

  async getCurrent(): Promise<WeatherSnapshot> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const obsRes = await this.fetchImpl(
        `https://api.weather.gov/stations/${this.station}/observations/latest`,
        { headers: this.headers, signal: controller.signal, cache: "no-store" }
      );
      if (!obsRes.ok) throw new Error(`NWS observation HTTP ${obsRes.status}`);
      const obs = parseNWSObservation(await obsRes.json());
      if (!obs) throw new Error("NWS observation could not be parsed");

      // Best-effort advisory lookup; never fail the whole call on this.
      let advisory = false;
      try {
        const alertRes = await this.fetchImpl(
          `https://api.weather.gov/alerts/active?point=${this.point}`,
          { headers: this.headers, signal: controller.signal, cache: "no-store" }
        );
        if (alertRes.ok) advisory = hasHeatAdvisory(await alertRes.json());
      } catch {
        // ignore — advisory stays false
      }

      const caution = heatCautionForTemp(obs.feelsLikeF);
      return {
        temperatureF: obs.temperatureF,
        feelsLikeF: obs.feelsLikeF,
        conditions: obs.conditions,
        advisory: advisory || caution === "extreme" || caution === "high",
        caution,
        attribution: {
          source: "National Weather Service",
          sourceUrl: "https://www.weather.gov/elp/",
          lastUpdated: obs.observedAt,
          confidence: "live",
        },
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

export function createWeatherProvider(
  kind: string | undefined = process.env.WEATHER_PROVIDER
): WeatherProvider {
  switch ((kind ?? "mock").toLowerCase()) {
    case "nws":
      return new NWSWeatherProvider();
    case "mock":
    default:
      return new MockWeatherProvider();
  }
}
