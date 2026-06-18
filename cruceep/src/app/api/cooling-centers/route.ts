import { handleRoute, jsonOk } from "@/lib/api";
import { getCoolingCenters } from "@/lib/services/cooling-centers";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const { centers, origin } = await getCoolingCenters();
    return jsonOk({ centers, origin });
  });
}
