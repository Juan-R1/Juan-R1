import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

/** Public, indexable pages (admin/login excluded from priority crawling). */
const PUBLIC_PATHS = [
  "",
  "/plan",
  "/bridges",
  "/alerts",
  "/cooling-centers",
  "/saved-routes",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
