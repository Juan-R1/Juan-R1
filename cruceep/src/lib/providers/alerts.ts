import type { ServiceAlert } from "@/lib/types";
import { buildSeedAlerts } from "@/data/alerts";

export interface AlertProvider {
  readonly name: string;
  getAlerts(): Promise<ServiceAlert[]>;
}

/** Returns the bundled sample alerts, sorted most-severe + most-recent first. */
export class MockAlertProvider implements AlertProvider {
  readonly name = "MockAlertProvider";

  constructor(private readonly now: () => Date = () => new Date()) {}

  async getAlerts(): Promise<ServiceAlert[]> {
    const severityRank: Record<string, number> = {
      severe: 0,
      major: 1,
      minor: 2,
      info: 3,
    };
    return buildSeedAlerts(this.now()).sort((a, b) => {
      const s = severityRank[a.severity] - severityRank[b.severity];
      if (s !== 0) return s;
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
  }
}

/**
 * Placeholder composite provider that would merge Sun Metro, ETA, CBP, NWS and
 * City feeds. Not implemented; documented in README.
 */
export class CompositeAlertProvider implements AlertProvider {
  readonly name = "CompositeAlertProvider";
  async getAlerts(): Promise<ServiceAlert[]> {
    throw new Error(
      "CompositeAlertProvider is not implemented yet. Set ALERT_PROVIDER=mock or implement official feed adapters (see README)."
    );
  }
}

export function createAlertProvider(
  kind: string | undefined = process.env.ALERT_PROVIDER
): AlertProvider {
  switch ((kind ?? "mock").toLowerCase()) {
    case "composite":
      return new CompositeAlertProvider();
    case "mock":
    default:
      return new MockAlertProvider();
  }
}
