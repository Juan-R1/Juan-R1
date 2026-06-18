import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is required for Next.js's hydration/runtime inline scripts
 * and styled-jsx; `'unsafe-eval'` is only added in development (React Refresh).
 * connect-src is widened to Supabase + the NWS API (the live weather source).
 * Moving to a strict nonce-based policy is tracked in the roadmap.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://*.supabase.co https://api.weather.gov",
  "worker-src 'self'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

/** Security headers applied to every route. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  // HSTS only in production (https). Harmless to omit in local http dev.
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: appRoot,
  // Allow the app to build even when optional integrations (Supabase, map keys)
  // are not configured. Pages degrade gracefully to mock providers at runtime.
  eslint: {
    // Lint is run explicitly via `npm run lint`; do not fail production builds on it.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes.
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
