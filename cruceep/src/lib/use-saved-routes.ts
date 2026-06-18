"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/client-api";
import { localRoutes } from "@/lib/local-routes";
import type { SavedRoute } from "@/lib/types";
import type { SavedRouteInput } from "@/lib/validation";

type Status = "loading" | "ready" | "error";

/**
 * Unified saved-routes store. Transparently uses Supabase when the user is
 * signed in, and browser-local storage otherwise — so saving a route always
 * works, with or without an account.
 */
export function useSavedRoutes() {
  const { user } = useAuth();
  const isRemote = Boolean(user);
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      if (isRemote) {
        const res = await apiFetch<{ routes: SavedRoute[] }>("/api/saved-routes");
        setRoutes(res.routes);
      } else {
        setRoutes(localRoutes.list());
      }
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [isRemote]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (input: SavedRouteInput): Promise<SavedRoute> => {
      if (isRemote) {
        const res = await apiFetch<{ route: SavedRoute }>("/api/saved-routes", {
          method: "POST",
          body: JSON.stringify(input),
        });
        setRoutes((prev) => [res.route, ...prev]);
        return res.route;
      }
      const route = localRoutes.add(input);
      setRoutes((prev) => [route, ...prev]);
      return route;
    },
    [isRemote]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      if (isRemote) {
        await apiFetch(`/api/saved-routes/${id}`, { method: "DELETE" });
      } else {
        localRoutes.remove(id);
      }
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    },
    [isRemote]
  );

  return { routes, status, isRemote, refresh, add, remove };
}
