import type { SavedRoute } from "@/lib/types";
import type { SavedRouteInput } from "@/lib/validation";
import { createId } from "@/lib/utils";

/**
 * Browser-local saved routes store (used when the user is not signed in or when
 * Supabase is not configured). Kept deliberately simple and dependency-free so
 * the core "save a route" flow works offline with zero accounts.
 */
const KEY = "cruceep.savedRoutes";

function read(): SavedRoute[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedRoute[]) : [];
  } catch {
    return [];
  }
}

function write(routes: SavedRoute[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(routes));
  } catch {
    // Ignore storage quota / private mode failures.
  }
}

export const localRoutes = {
  list(): SavedRoute[] {
    return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  add(input: SavedRouteInput): SavedRoute {
    const now = new Date().toISOString();
    const route: SavedRoute = {
      id: createId(),
      userId: null,
      name: input.name,
      origin: input.origin,
      destination: input.destination,
      tripType: input.tripType ?? "local",
      preferredMode: input.preferredMode ?? "driving",
      favoriteBridge: input.favoriteBridge ?? null,
      metadata: input.metadata,
      createdAt: now,
      updatedAt: now,
    };
    write([route, ...read()]);
    return route;
  },

  remove(id: string): void {
    write(read().filter((r) => r.id !== id));
  },

  clear(): void {
    write([]);
  },
};
