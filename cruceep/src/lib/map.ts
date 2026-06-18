/**
 * Map provider abstraction.
 *
 * The MVP is list-first (no embedded tiles), but map provider selection is
 * already abstracted here so a `<MapView>` can be added later without hardcoding
 * a vendor throughout the app. Switch providers via NEXT_PUBLIC_MAP_PROVIDER.
 */
export type MapProviderKind = "leaflet" | "mapbox" | "google";

export interface MapConfig {
  provider: MapProviderKind;
  /** Whether the provider needs an API key that is currently present. */
  ready: boolean;
  /** Public token/key for the selected provider, when applicable. */
  token?: string;
  /** Default map center: El Paso–Juárez metro. */
  center: { lat: number; lng: number };
  defaultZoom: number;
  /** OSM tile URL used by the keyless Leaflet default. */
  osmTileUrl: string;
  attribution: string;
}

export function getMapConfig(): MapConfig {
  const provider = (
    process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "leaflet"
  ).toLowerCase() as MapProviderKind;

  const center = { lat: 31.7587, lng: -106.4869 }; // Downtown El Paso
  const base = {
    center,
    defaultZoom: 11,
    osmTileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
  };

  switch (provider) {
    case "mapbox": {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      return { provider, ready: Boolean(token), token, ...base };
    }
    case "google": {
      const token = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      return { provider, ready: Boolean(token), token, ...base };
    }
    case "leaflet":
    default:
      // OpenStreetMap/Leaflet needs no key.
      return { provider: "leaflet", ready: true, ...base };
  }
}

/** Build a vendor-neutral "directions" link for an address (used by cards). */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}
