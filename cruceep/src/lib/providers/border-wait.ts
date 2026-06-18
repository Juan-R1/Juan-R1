import type { BridgeWait, CrossingDirection, SourceAttribution } from "@/lib/types";
import { SEED_BRIDGES } from "@/data/bridges";

/**
 * Adapter interface for border crossing wait times.
 *
 * Implementations:
 *  - MockBorderWaitProvider  — deterministic sample data (offline, demo).
 *  - CBPBorderWaitProvider   — future adapter for CBP Border Wait Times.
 *
 * The UI only ever depends on this interface, never on a concrete source.
 */
export interface BorderWaitProvider {
  readonly name: string;
  /** Fetch wait times for all active bridges, optionally a single direction. */
  getWaits(direction?: CrossingDirection): Promise<BridgeWait[]>;
}

/**
 * Deterministic mock that produces believable but clearly-labeled wait times.
 * Values vary by time-of-day so the demo feels alive without being random.
 */
export class MockBorderWaitProvider implements BorderWaitProvider {
  readonly name = "MockBorderWaitProvider";

  constructor(private readonly now: () => Date = () => new Date()) {}

  async getWaits(direction: CrossingDirection = "northbound"): Promise<BridgeWait[]> {
    const now = this.now();
    const attribution: SourceAttribution = {
      source: "CBP Border Wait Times (sample)",
      sourceUrl: "https://bwt.cbp.gov/",
      lastUpdated: now.toISOString(),
      confidence: "mock",
    };

    // Time-of-day factor: heavier waits during morning/evening crossing peaks.
    const hour = now.getHours();
    const peak = hour >= 6 && hour <= 9 ? 1.6 : hour >= 15 && hour <= 19 ? 1.4 : 1;

    return SEED_BRIDGES.filter((b) => b.active).map((bridge, index) => {
      // A stable base per bridge keeps the demo consistent within a session.
      const base = 10 + ((index * 7) % 35);
      const vehicle = Math.round(base * peak);
      const pedestrian = Math.round((base / 2) * peak);
      const closed = bridge.id === "tornillo-guadalupe" && (hour < 6 || hour > 20);

      return {
        bridgeId: bridge.id,
        bridgeName: bridge.name,
        direction,
        attribution,
        lanes: [
          {
            mode: "vehicle",
            laneType: "General",
            waitMinutes: closed ? null : vehicle,
            status: closed ? "closed" : vehicle > 45 ? "delay" : "open",
          },
          {
            mode: "ready_lane",
            laneType: "Ready Lane",
            waitMinutes: closed ? null : Math.max(2, Math.round(vehicle * 0.6)),
            status: closed ? "closed" : "open",
          },
          {
            mode: "pedestrian",
            laneType: "Pedestrian",
            waitMinutes: closed ? null : pedestrian,
            status: closed ? "closed" : "open",
          },
        ],
      };
    });
  }
}

/**
 * Placeholder for the future official integration. Throwing here keeps the
 * surface honest: selecting `cbp` before it is implemented fails loudly in
 * server logs rather than silently returning fake "live" data.
 *
 * To implement: fetch https://bwt.cbp.gov/api/... , map ports to our bridge
 * ids, and return `confidence: "live"` / `"cached"` accordingly.
 */
export class CBPBorderWaitProvider implements BorderWaitProvider {
  readonly name = "CBPBorderWaitProvider";
  async getWaits(): Promise<BridgeWait[]> {
    throw new Error(
      "CBPBorderWaitProvider is not implemented yet. Set BORDER_WAIT_PROVIDER=mock or implement the CBP adapter (see README)."
    );
  }
}

export function createBorderWaitProvider(
  kind: string | undefined = process.env.BORDER_WAIT_PROVIDER
): BorderWaitProvider {
  switch ((kind ?? "mock").toLowerCase()) {
    case "cbp":
      return new CBPBorderWaitProvider();
    case "mock":
    default:
      return new MockBorderWaitProvider();
  }
}
