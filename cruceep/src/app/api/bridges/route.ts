import { handleRoute, jsonOk } from "@/lib/api";
import { createBorderWaitProvider } from "@/lib/providers/border-wait";
import { MockBorderWaitProvider } from "@/lib/providers/border-wait";
import type { CrossingDirection } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const url = new URL(request.url);
    const dirParam = url.searchParams.get("direction");
    const direction: CrossingDirection =
      dirParam === "southbound" ? "southbound" : "northbound";

    let provider = createBorderWaitProvider();
    let waits;
    try {
      waits = await provider.getWaits(direction);
    } catch {
      // A future live provider may be selected but not implemented/healthy.
      // Degrade to mock so the UI still renders (clearly labeled as sample).
      provider = new MockBorderWaitProvider();
      waits = await provider.getWaits(direction);
    }

    return jsonOk({ direction, waits, provider: provider.name });
  });
}
