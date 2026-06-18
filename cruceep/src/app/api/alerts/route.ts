import { handleRoute, jsonOk } from "@/lib/api";
import { getAlerts } from "@/lib/services/alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const { alerts, origin } = await getAlerts();
    return jsonOk({ alerts, origin });
  });
}
