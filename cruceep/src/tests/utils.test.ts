import { describe, it, expect } from "vitest";
import {
  cn,
  clamp,
  createId,
  formatRelativeTime,
  formatTimestamp,
} from "@/lib/utils";

describe("cn", () => {
  it("merges and dedupes tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("clamp", () => {
  it("bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("createId", () => {
  it("returns unique non-empty ids", () => {
    const a = createId();
    const b = createId();
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-06-18T12:00:00Z");

  it("handles missing/invalid input bilingually", () => {
    expect(formatRelativeTime(null, "en", now)).toBe("no data");
    expect(formatRelativeTime(undefined, "es", now)).toBe("sin datos");
    expect(formatRelativeTime("not-a-date", "en", now)).toBe("no data");
  });

  it("reports just-now for very recent timestamps", () => {
    const iso = new Date(now.getTime() - 20_000).toISOString();
    expect(formatRelativeTime(iso, "en", now)).toBe("just now");
    expect(formatRelativeTime(iso, "es", now)).toBe("ahora mismo");
  });

  it("reports minutes ago", () => {
    const iso = new Date(now.getTime() - 5 * 60_000).toISOString();
    expect(formatRelativeTime(iso, "en", now)).toMatch(/5 min/i);
  });
});

describe("formatTimestamp", () => {
  it("returns a dash for empty values", () => {
    expect(formatTimestamp(null)).toBe("—");
    expect(formatTimestamp("nope")).toBe("—");
  });
  it("formats a valid timestamp", () => {
    expect(formatTimestamp("2026-06-18T12:00:00Z", "en")).toMatch(/2026/);
  });
});
