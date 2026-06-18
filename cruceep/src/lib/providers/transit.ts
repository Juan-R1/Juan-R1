import type {
  SourceAttribution,
  TransitLeg,
  TripPlan,
  TripRequest,
} from "@/lib/types";
import { SEED_BRIDGES } from "@/data/bridges";

export interface TransitProvider {
  readonly name: string;
  planTrip(request: TripRequest): Promise<TripPlan>;
}

/**
 * Placeholder trip engine. It assembles a believable multi-leg plan from the
 * request shape without claiming to be a real routing result — every plan is
 * flagged `beta` and attributed as an estimate so the UI can label it clearly.
 *
 * Replace with SunMetroGTFSProvider / ETAGTFSProvider for real routing.
 */
export class MockTransitProvider implements TransitProvider {
  readonly name = "MockTransitProvider";

  constructor(private readonly now: () => Date = () => new Date()) {}

  async planTrip(request: TripRequest): Promise<TripPlan> {
    const now = this.now();
    const legs: TransitLeg[] = [];

    const addWalk = (label: string, minutes: number) =>
      legs.push({ kind: "walk", label, durationMinutes: minutes });

    // Always begin with a short access walk.
    addWalk("Walk to start", 5);

    let suggestedBridgeId: string | undefined;
    let suggestedBridgeName: string | undefined;
    let estimatedBridgeWaitMinutes: number | undefined;

    switch (request.preferredMode) {
      case "sun_metro":
        legs.push({
          kind: "bus",
          label: "Sun Metro bus",
          line: "Sun Metro 24",
          durationMinutes: 28,
        });
        break;
      case "eta":
        legs.push({
          kind: "bus",
          label: "County ETA route",
          line: "ETA Mission Valley",
          durationMinutes: 42,
        });
        break;
      case "walking":
        legs.push({ kind: "walk", label: "Walking segment", durationMinutes: 35 });
        break;
      case "mixed":
        legs.push({
          kind: "brt",
          label: "Brio rapid transit",
          line: "Brio Mesa",
          durationMinutes: 22,
        });
        legs.push({ kind: "bus", label: "Sun Metro connection", line: "Sun Metro 50", durationMinutes: 14 });
        break;
      case "driving":
      default:
        legs.push({ kind: "drive", label: "Drive", durationMinutes: 18 });
        break;
    }

    // Cross-border trips add a recommended bridge + a border-wait leg.
    if (request.tripType === "cross_border") {
      // Cheap heuristic: pick the first active downtown bridge for pedestrians,
      // Ysleta–Zaragoza otherwise. A real engine would weigh live waits here.
      const pickId =
        request.preferredMode === "walking" ? "pdn-santa-fe" : "ysleta-zaragoza";
      const bridge = SEED_BRIDGES.find((b) => b.id === pickId) ?? SEED_BRIDGES[0];
      suggestedBridgeId = bridge.id;
      suggestedBridgeName = bridge.name;
      // Estimated wait derived from a stable per-bridge base value.
      const index = SEED_BRIDGES.findIndex((b) => b.id === bridge.id);
      estimatedBridgeWaitMinutes = 12 + ((index * 9) % 30);
      legs.push({
        kind: "border",
        label: `Cross at ${bridge.name}`,
        durationMinutes: estimatedBridgeWaitMinutes,
      });
    }

    addWalk("Walk to destination", 6);

    const totalMinutes = legs.reduce((sum, leg) => sum + leg.durationMinutes, 0);

    const attribution: SourceAttribution = {
      source: "CruceEP estimate (beta)",
      lastUpdated: now.toISOString(),
      confidence: "estimated",
    };

    return {
      request,
      legs,
      totalMinutes,
      suggestedBridgeId,
      suggestedBridgeName,
      estimatedBridgeWaitMinutes,
      attribution,
      beta: true,
    };
  }
}

/** Placeholder for the future Sun Metro GTFS / GTFS-realtime adapter. */
export class SunMetroGTFSProvider implements TransitProvider {
  readonly name = "SunMetroGTFSProvider";
  async planTrip(): Promise<TripPlan> {
    throw new Error(
      "SunMetroGTFSProvider is not implemented yet. Set TRANSIT_PROVIDER=mock or implement the GTFS adapter (see README)."
    );
  }
}

/** Placeholder for the future El Paso County ETA GTFS adapter. */
export class ETAGTFSProvider implements TransitProvider {
  readonly name = "ETAGTFSProvider";
  async planTrip(): Promise<TripPlan> {
    throw new Error(
      "ETAGTFSProvider is not implemented yet. Set TRANSIT_PROVIDER=mock or implement the GTFS adapter (see README)."
    );
  }
}

export function createTransitProvider(
  kind: string | undefined = process.env.TRANSIT_PROVIDER
): TransitProvider {
  switch ((kind ?? "mock").toLowerCase()) {
    case "sunmetro-gtfs":
      return new SunMetroGTFSProvider();
    case "eta-gtfs":
      return new ETAGTFSProvider();
    case "mock":
    default:
      return new MockTransitProvider();
  }
}
