import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep admin + API out of search indexes.
      disallow: ["/admin", "/api/", "/auth/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
