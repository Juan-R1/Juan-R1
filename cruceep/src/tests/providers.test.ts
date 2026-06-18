import { describe, it, expect } from "vitest";
import {
  MockBorderWaitProvider,
  CBPBorderWaitProvider,
  createBorderWaitProvider,
} from "@/lib/providers/border-wait";
import {
  MockWeatherProvider,
  heatCautionForTemp,
  createWeatherProvider,
} from "@/lib/providers/weather";
import { MockTransitProvider } from "@/lib/providers/transit";
import { MockAlertProvider } from "@/lib/providers/alerts";
import { MockCoolingCenterProvider } from "@/lib/providers/cooling-centers";

describe("MockBorderWaitProvider", () => {
  it("returns a wait entry for every active bridge with attribution", async () => {
    const provider = new MockBorderWaitProvider(() => new Date("2026-06-18T08:00:00"));
    const waits = await provider.getWaits("northbound");
    expect(waits.length).toBeGreaterThanOrEqual(5);
    for (const w of waits) {
      expect(w.bridgeId).toBeTruthy();
      expect(w.direction).toBe("northbound");
      expect(w.lanes.length).toBeGreaterThan(0);
      // Mock data must always be labeled as mock.
      expect(w.attribution.confidence).toBe("mock");
      expect(w.attribution.source).toMatch(/sample/i);
    }
  });

  it("produces deterministic output for a fixed clock", async () => {
    const clock = () => new Date("2026-06-18T08:00:00");
    const a = await new MockBorderWaitProvider(clock).getWaits();
    const b = await new MockBorderWaitProvider(clock).getWaits();
    expect(a).toEqual(b);
  });

  it("applies heavier waits during peak hours", async () => {
    const peak = await new MockBorderWaitProvider(
      () => new Date("2026-06-18T08:00:00")
    ).getWaits();
    const offPeak = await new MockBorderWaitProvider(
      () => new Date("2026-06-18T12:00:00")
    ).getWaits();
    const peakVehicle = peak[0].lanes.find((l) => l.mode === "vehicle")!.waitMinutes!;
    const offVehicle = offPeak[0].lanes.find((l) => l.mode === "vehicle")!.waitMinutes!;
    expect(peakVehicle).toBeGreaterThan(offVehicle);
  });
});

describe("CBPBorderWaitProvider (not yet implemented)", () => {
  it("throws a clear error rather than faking live data", async () => {
    await expect(new CBPBorderWaitProvider().getWaits()).rejects.toThrow(
      /not implemented/i
    );
  });
});

describe("createBorderWaitProvider factory", () => {
  it("defaults to the mock provider", () => {
    expect(createBorderWaitProvider(undefined).name).toBe("MockBorderWaitProvider");
    expect(createBorderWaitProvider("mock").name).toBe("MockBorderWaitProvider");
  });
  it("selects the CBP provider when requested", () => {
    expect(createBorderWaitProvider("cbp").name).toBe("CBPBorderWaitProvider");
  });
});

describe("heatCautionForTemp", () => {
  it("maps temperatures to caution levels", () => {
    expect(heatCautionForTemp(80)).toBe("low");
    expect(heatCautionForTemp(92)).toBe("moderate");
    expect(heatCautionForTemp(101)).toBe("high");
    expect(heatCautionForTemp(106)).toBe("extreme");
  });
});

describe("MockWeatherProvider", () => {
  it("is hotter in the afternoon than early morning", async () => {
    const afternoon = await new MockWeatherProvider(
      () => new Date("2026-06-18T16:00:00")
    ).getCurrent();
    const morning = await new MockWeatherProvider(
      () => new Date("2026-06-18T05:00:00")
    ).getCurrent();
    expect(afternoon.temperatureF).toBeGreaterThan(morning.temperatureF);
    expect(afternoon.attribution.confidence).toBe("mock");
  });

  it("factory defaults to mock", () => {
    expect(createWeatherProvider(undefined).name).toBe("MockWeatherProvider");
  });
});

describe("MockTransitProvider", () => {
  it("adds a suggested bridge + border leg for cross-border trips", async () => {
    const plan = await new MockTransitProvider().planTrip({
      origin: "Downtown El Paso",
      destination: "Juárez Centro",
      tripType: "cross_border",
      preferredMode: "driving",
      when: "now",
    });
    expect(plan.beta).toBe(true);
    expect(plan.suggestedBridgeId).toBeTruthy();
    expect(plan.legs.some((l) => l.kind === "border")).toBe(true);
    expect(plan.totalMinutes).toBe(
      plan.legs.reduce((s, l) => s + l.durationMinutes, 0)
    );
    expect(plan.attribution.confidence).toBe("estimated");
  });

  it("uses a transit leg for Sun Metro trips and no bridge for local trips", async () => {
    const plan = await new MockTransitProvider().planTrip({
      origin: "UTEP",
      destination: "Cielo Vista",
      tripType: "local",
      preferredMode: "sun_metro",
      when: "now",
    });
    expect(plan.suggestedBridgeId).toBeUndefined();
    expect(plan.legs.some((l) => l.kind === "bus")).toBe(true);
  });
});

describe("MockAlertProvider", () => {
  it("returns alerts sorted with the most severe first", async () => {
    const alerts = await new MockAlertProvider(
      () => new Date("2026-06-18T12:00:00")
    ).getAlerts();
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].severity).toBe("severe");
    alerts.forEach((a) => expect(a.confidence).toBe("mock"));
  });
});

describe("MockCoolingCenterProvider", () => {
  it("returns only active cooling centers", async () => {
    const centers = await new MockCoolingCenterProvider().getCoolingCenters();
    expect(centers.length).toBeGreaterThan(0);
    expect(centers.every((c) => c.active)).toBe(true);
  });
});
