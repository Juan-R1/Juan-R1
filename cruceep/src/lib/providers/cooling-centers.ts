import type { CoolingCenter } from "@/lib/types";
import { SEED_COOLING_CENTERS } from "@/data/cooling-centers";

export interface CoolingCenterProvider {
  readonly name: string;
  getCoolingCenters(): Promise<CoolingCenter[]>;
}

/** Returns the bundled sample cooling centers (active only). */
export class MockCoolingCenterProvider implements CoolingCenterProvider {
  readonly name = "MockCoolingCenterProvider";
  async getCoolingCenters(): Promise<CoolingCenter[]> {
    return SEED_COOLING_CENTERS.filter((c) => c.active);
  }
}

export function createCoolingCenterProvider(): CoolingCenterProvider {
  return new MockCoolingCenterProvider();
}
