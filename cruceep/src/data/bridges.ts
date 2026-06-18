import type { Bridge } from "@/lib/types";

/**
 * El Paso–area international ports of entry plus regional context crossings.
 * Coordinates are approximate and for display/seed purposes only.
 */
export const SEED_BRIDGES: Bridge[] = [
  {
    id: "pdn-santa-fe",
    name: "Paso del Norte (Santa Fe)",
    alternateNames: ["Santa Fe Street Bridge", "PDN", "El Paso Downtown"],
    city: "El Paso",
    countryPair: "US-MX",
    latitude: 31.7522,
    longitude: -106.4869,
    active: true,
  },
  {
    id: "stanton",
    name: "Stanton Street",
    alternateNames: ["Lerdo", "Stanton/Lerdo"],
    city: "El Paso",
    countryPair: "US-MX",
    latitude: 31.7585,
    longitude: -106.4797,
    active: true,
  },
  {
    id: "ysleta-zaragoza",
    name: "Ysleta–Zaragoza",
    alternateNames: ["Zaragoza", "Ysleta"],
    city: "El Paso",
    countryPair: "US-MX",
    latitude: 31.6707,
    longitude: -106.3266,
    active: true,
  },
  {
    id: "bota",
    name: "Bridge of the Americas",
    alternateNames: ["BOTA", "Cordova", "Free Bridge"],
    city: "El Paso",
    countryPair: "US-MX",
    latitude: 31.7681,
    longitude: -106.4451,
    active: true,
  },
  {
    id: "tornillo-guadalupe",
    name: "Tornillo–Guadalupe",
    alternateNames: ["Marcelino Serna", "Tornillo"],
    city: "Tornillo",
    countryPair: "US-MX",
    latitude: 31.4406,
    longitude: -106.0859,
    active: true,
  },
  {
    id: "santa-teresa",
    name: "Santa Teresa",
    alternateNames: ["San Jeronimo", "Jeronimo–Santa Teresa"],
    city: "Santa Teresa (NM)",
    countryPair: "US-MX",
    latitude: 31.7847,
    longitude: -106.6936,
    active: true,
  },
];
