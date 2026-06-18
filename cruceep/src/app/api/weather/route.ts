import { handleRoute, jsonOk } from "@/lib/api";
import {
  createWeatherProvider,
  MockWeatherProvider,
} from "@/lib/providers/weather";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    let provider = createWeatherProvider();
    let weather;
    try {
      weather = await provider.getCurrent();
    } catch {
      provider = new MockWeatherProvider();
      weather = await provider.getCurrent();
    }
    return jsonOk({ weather, provider: provider.name });
  });
}
