import { handleRoute, jsonOk, parseBody } from "@/lib/api";
import { tripRequestSchema } from "@/lib/validation";
import {
  createTransitProvider,
  MockTransitProvider,
} from "@/lib/providers/transit";
import {
  createWeatherProvider,
  MockWeatherProvider,
} from "@/lib/providers/weather";
import { getAlerts } from "@/lib/services/alerts";
import type { TripRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const input = await parseBody(request, tripRequestSchema);
    const tripRequest = input as TripRequest;

    // Trip plan (degrade to mock if a future provider isn't implemented).
    let transit = createTransitProvider();
    let plan;
    try {
      plan = await transit.planTrip(tripRequest);
    } catch {
      transit = new MockTransitProvider();
      plan = await transit.planTrip(tripRequest);
    }

    // Heat/weather context.
    let weatherProvider = createWeatherProvider();
    let weather;
    try {
      weather = await weatherProvider.getCurrent();
    } catch {
      weatherProvider = new MockWeatherProvider();
      weather = await weatherProvider.getCurrent();
    }

    // Surface alerts relevant to the trip type.
    const { alerts, origin } = await getAlerts();
    const relevant = alerts.filter((a) => {
      if (tripRequest.tripType === "cross_border") {
        return ["bridge", "weather"].includes(a.category);
      }
      if (tripRequest.tripType === "heat_safe") {
        return ["weather", "cooling_center"].includes(a.category);
      }
      if (tripRequest.preferredMode === "sun_metro") return a.category === "sun_metro";
      if (tripRequest.preferredMode === "eta") return a.category === "eta";
      return a.severity === "severe" || a.severity === "major";
    });

    return jsonOk({
      plan,
      weather,
      alerts: relevant,
      alertsOrigin: origin,
      provider: transit.name,
    });
  });
}
