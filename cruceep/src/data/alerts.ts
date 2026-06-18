import type { ServiceAlert } from "@/lib/types";

/**
 * Sample service alerts used by MockAlertProvider and the SQL seed.
 * Timestamps are computed relative to "now" so the demo always looks fresh.
 */
export function buildSeedAlerts(now: Date = new Date()): ServiceAlert[] {
  const iso = (offsetMin: number) =>
    new Date(now.getTime() + offsetMin * 60000).toISOString();

  return [
    {
      id: "alert-sunmetro-route8",
      titleEn: "Route 8 detour near Downtown",
      titleEs: "Desvío de la Ruta 8 cerca del Centro",
      bodyEn:
        "Sun Metro Route 8 is detouring around Santa Fe St due to roadwork. Expect 5–10 minute delays.",
      bodyEs:
        "La Ruta 8 de Sun Metro tiene un desvío alrededor de la calle Santa Fe por obras. Espere demoras de 5 a 10 minutos.",
      category: "sun_metro",
      severity: "minor",
      affectedArea: "Downtown El Paso",
      source: "Sun Metro (sample)",
      sourceUrl: "https://www.sunmetro.net/",
      startsAt: iso(-120),
      endsAt: iso(600),
      lastUpdated: iso(-25),
      confidence: "mock",
    },
    {
      id: "alert-eta-mission-valley",
      titleEn: "ETA Mission Valley schedule change",
      titleEs: "Cambio de horario de ETA en Mission Valley",
      bodyEn:
        "County ETA service to Mission Valley shifts to summer hours starting Monday. Check the schedule before traveling.",
      bodyEs:
        "El servicio ETA del condado a Mission Valley cambia a horario de verano a partir del lunes. Revise el horario antes de viajar.",
      category: "eta",
      severity: "info",
      affectedArea: "Mission Valley / Rural El Paso County",
      source: "El Paso County ETA (sample)",
      sourceUrl: "https://www.epcounty.com/eta/",
      startsAt: iso(-60),
      endsAt: null,
      lastUpdated: iso(-90),
      confidence: "mock",
    },
    {
      id: "alert-bridge-ysleta-delay",
      titleEn: "Heavy southbound delays at Ysleta–Zaragoza",
      titleEs: "Demoras fuertes hacia el sur en Ysleta–Zaragoza",
      bodyEn:
        "Southbound vehicle lanes at Ysleta–Zaragoza are experiencing heavier-than-usual delays this afternoon.",
      bodyEs:
        "Los carriles vehiculares hacia el sur en Ysleta–Zaragoza tienen demoras más fuertes de lo normal esta tarde.",
      category: "bridge",
      severity: "major",
      affectedArea: "Ysleta–Zaragoza International Bridge",
      source: "CBP Border Wait Times (sample)",
      sourceUrl: "https://bwt.cbp.gov/",
      startsAt: iso(-45),
      endsAt: iso(180),
      lastUpdated: iso(-12),
      confidence: "mock",
    },
    {
      id: "alert-weather-heat",
      titleEn: "Excessive Heat Warning",
      titleEs: "Advertencia de Calor Excesivo",
      bodyEn:
        "An Excessive Heat Warning is in effect through this evening. Highs near 105°F. Limit time outdoors and hydrate.",
      bodyEs:
        "Hay una Advertencia de Calor Excesivo vigente hasta esta noche. Máximas cerca de 40°C. Limite el tiempo al aire libre e hidrátese.",
      category: "weather",
      severity: "severe",
      affectedArea: "El Paso County",
      source: "National Weather Service (sample)",
      sourceUrl: "https://www.weather.gov/elp/",
      startsAt: iso(-30),
      endsAt: iso(360),
      lastUpdated: iso(-15),
      confidence: "mock",
    },
    {
      id: "alert-cooling-centers-open",
      titleEn: "City cooling centers open extended hours",
      titleEs: "Centros de enfriamiento de la ciudad con horario extendido",
      bodyEn:
        "City of El Paso libraries and recreation centers are open as cooling centers with extended hours during the heat warning.",
      bodyEs:
        "Las bibliotecas y centros recreativos de la Ciudad de El Paso están abiertos como centros de enfriamiento con horario extendido durante la advertencia de calor.",
      category: "cooling_center",
      severity: "info",
      affectedArea: "Citywide",
      source: "City of El Paso (sample)",
      sourceUrl: "https://www.elpasotexas.gov/",
      startsAt: iso(-30),
      endsAt: iso(720),
      lastUpdated: iso(-40),
      confidence: "mock",
    },
  ];
}
