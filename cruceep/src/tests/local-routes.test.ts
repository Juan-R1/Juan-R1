import { describe, it, expect, beforeEach } from "vitest";
import { localRoutes } from "@/lib/local-routes";

describe("localRoutes (browser storage)", () => {
  beforeEach(() => {
    localRoutes.clear();
  });

  it("starts empty", () => {
    expect(localRoutes.list()).toEqual([]);
  });

  it("adds and lists a route", () => {
    const route = localRoutes.add({
      name: "Home to Work",
      origin: "Home",
      destination: "Work",
      tripType: "local",
      preferredMode: "driving",
    });
    expect(route.id).toBeTruthy();
    expect(route.userId).toBeNull();
    const list = localRoutes.list();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Home to Work");
  });

  it("removes a route by id", () => {
    const a = localRoutes.add({ name: "A", origin: "x", destination: "y" } as never);
    localRoutes.add({ name: "B", origin: "x", destination: "y" } as never);
    localRoutes.remove(a.id);
    const list = localRoutes.list();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("B");
  });
});
