import { describe, it, expect } from "vitest";
import {
  MockBorderWaitProvider,
  CBPBorderWaitProvider,
  createBorderWaitProvider,
} from "@/lib/providers/border-wait";
import {
  MockWeatherProvider,
  NWSWeatherProvider,
  heatCautionForTemp,
  createWeatherProvider,
  parseNWSObservation,
  hasHeatAdvisory,
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

describe("NWS weather parsing", () => {
  it("parses temperature and heat index from an observation", () => {
    const parsed = parseNWSObservation({
      properties: {
        temperature: { value: 40 }, // 40°C -> 104°F
        heatIndex: { value: 43 }, // 43°C -> 109°F
        textDescription: "Sunny",
        timestamp: "2026-06-18T21:00:00+00:00",
      },
    });
    expect(parsed).not.toBeNull();
    expect(parsed!.temperatureF).toBe(104);
    expect(parsed!.feelsLikeF).toBe(109);
    expect(parsed!.conditions).toBe("Sunny");
  });

  it("falls back to temperature when heat index is missing", () => {
    const parsed = parseNWSObservation({
      properties: { temperature: { value: 20 }, heatIndex: { value: null } },
    });
    expect(parsed!.temperatureF).toBe(68);
    expect(parsed!.feelsLikeF).toBe(68);
  });

  it("returns null for an unusable payload", () => {
    expect(parseNWSObservation({})).toBeNull();
    expect(parseNWSObservation({ properties: { temperature: { value: null } } })).toBeNull();
  });

  it("detects heat-related active alerts", () => {
    expect(
      hasHeatAdvisory({ features: [{ properties: { event: "Excessive Heat Warning" } }] })
    ).toBe(true);
    expect(
      hasHeatAdvisory({ features: [{ properties: { event: "Flood Watch" } }] })
    ).toBe(false);
    expect(hasHeatAdvisory({})).toBe(false);
  });
});

describe("NWSWeatherProvider (mocked fetch, no network)", () => {
  it("returns a live snapshot from observation + alerts", async () => {
    const fakeFetch = (async (url: string) => {
      if (url.includes("/observations/latest")) {
        return {
          ok: true,
          json: async () => ({
            properties: {
              temperature: { value: 41 },
              heatIndex: { value: 44 },
              textDescription: "Hot",
              timestamp: "2026-06-18T21:00:00+00:00",
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          features: [{ properties: { event: "Heat Advisory" } }],
        }),
      } as Response;
    }) as unknown as typeof fetch;

    const provider = new NWSWeatherProvider("KELP", "31.7587,-106.4869", fakeFetch);
    const snap = await provider.getCurrent();
    expect(snap.attribution.confidence).toBe("live");
    expect(snap.attribution.source).toBe("National Weather Service");
    expect(snap.temperatureF).toBe(106);
    expect(snap.advisory).toBe(true);
    expect(snap.caution).toBe("extreme");
  });

  it("throws when the observation request fails (so callers fall back to mock)", async () => {
    const failing = (async () => ({ ok: false, status: 503 }) as Response) as unknown as typeof fetch;
    const provider = new NWSWeatherProvider("KELP", "31.7587,-106.4869", failing);
    await expect(provider.getCurrent()).rejects.toThrow(/NWS observation/i);
  });

  it("factory selects NWS when requested", () => {
    expect(createWeatherProvider("nws").name).toBe("NWSWeatherProvider");
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
