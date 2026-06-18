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

/**
 * Placeholder for the future NWS integration (api.weather.gov). Not implemented.
 */
export class NWSWeatherProvider implements WeatherProvider {
  readonly name = "NWSWeatherProvider";
  async getCurrent(): Promise<WeatherSnapshot> {
    throw new Error(
      "NWSWeatherProvider is not implemented yet. Set WEATHER_PROVIDER=mock or implement the NWS adapter (see README)."
    );
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
