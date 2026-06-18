import { describe, it, expect } from "vitest";
import {
  tripRequestSchema,
  savedRouteInputSchema,
  alertInputSchema,
  coolingCenterInputSchema,
  flattenZodError,
} from "@/lib/validation";

describe("tripRequestSchema", () => {
  it("accepts a valid 'now' request", () => {
    const res = tripRequestSchema.safeParse({
      origin: "A",
      destination: "B",
      tripType: "local",
      preferredMode: "driving",
      when: "now",
    });
    expect(res.success).toBe(true);
  });

  it("requires departAt when when=later", () => {
    const res = tripRequestSchema.safeParse({
      origin: "A",
      destination: "B",
      tripType: "local",
      preferredMode: "driving",
      when: "later",
    });
    expect(res.success).toBe(false);
  });

  it("rejects empty origin/destination", () => {
    const res = tripRequestSchema.safeParse({
      origin: "  ",
      destination: "",
      tripType: "local",
      preferredMode: "driving",
      when: "now",
    });
    expect(res.success).toBe(false);
  });

  it("rejects an invalid trip type", () => {
    const res = tripRequestSchema.safeParse({
      origin: "A",
      destination: "B",
      tripType: "teleport",
      preferredMode: "driving",
      when: "now",
    });
    expect(res.success).toBe(false);
  });
});

describe("savedRouteInputSchema", () => {
  it("applies defaults for trip type and mode", () => {
    const res = savedRouteInputSchema.parse({
      name: "Home to Work",
      origin: "Home",
      destination: "Work",
    });
    expect(res.tripType).toBe("local");
    expect(res.preferredMode).toBe("driving");
  });

  it("requires a name", () => {
    expect(
      savedRouteInputSchema.safeParse({
        name: "",
        origin: "Home",
        destination: "Work",
      }).success
    ).toBe(false);
  });
});

describe("alertInputSchema", () => {
  it("requires bilingual title + body", () => {
    const res = alertInputSchema.safeParse({
      titleEn: "Hi",
      titleEs: "",
      bodyEn: "Body",
      bodyEs: "Cuerpo",
      category: "city",
      severity: "info",
      source: "City",
    });
    expect(res.success).toBe(false);
  });

  it("accepts a complete alert", () => {
    const res = alertInputSchema.safeParse({
      titleEn: "Hi",
      titleEs: "Hola",
      bodyEn: "Body",
      bodyEs: "Cuerpo",
      category: "weather",
      severity: "severe",
      source: "NWS",
      sourceUrl: "https://weather.gov",
    });
    expect(res.success).toBe(true);
  });
});

describe("coolingCenterInputSchema", () => {
  it("validates latitude bounds", () => {
    const res = coolingCenterInputSchema.safeParse({
      name: "Library",
      type: "library",
      address: "123 Main",
      source: "City",
      latitude: 200,
    });
    expect(res.success).toBe(false);
  });

  it("accepts a valid record with empty optional url", () => {
    const res = coolingCenterInputSchema.safeParse({
      name: "Library",
      type: "library",
      address: "123 Main",
      source: "City",
      website: "",
    });
    expect(res.success).toBe(true);
  });
});

describe("flattenZodError", () => {
  it("produces a field->message map", () => {
    const res = tripRequestSchema.safeParse({
      origin: "",
      destination: "",
      tripType: "local",
      preferredMode: "driving",
      when: "now",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const flat = flattenZodError(res.error);
      expect(Object.keys(flat).length).toBeGreaterThan(0);
    }
  });
});
