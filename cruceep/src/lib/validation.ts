import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export const tripTypeSchema = z.enum([
  "local",
  "cross_border",
  "transit",
  "heat_safe",
]);

export const preferredModeSchema = z.enum([
  "driving",
  "walking",
  "sun_metro",
  "eta",
  "mixed",
]);

export const departureWhenSchema = z.enum(["now", "later"]);

export const alertCategorySchema = z.enum([
  "sun_metro",
  "eta",
  "bridge",
  "weather",
  "cooling_center",
  "city",
]);

export const alertSeveritySchema = z.enum(["info", "minor", "major", "severe"]);

export const coolingCenterTypeSchema = z.enum([
  "cooling_center",
  "library",
  "public_facility",
  "shelter",
  "recreation_center",
]);

export const localeSchema = z.enum(["en", "es"]);

// ---------------------------------------------------------------------------
// Trip planning
// ---------------------------------------------------------------------------

export const tripRequestSchema = z
  .object({
    origin: z.string().trim().min(1, "Origin is required").max(160),
    destination: z.string().trim().min(1, "Destination is required").max(160),
    tripType: tripTypeSchema,
    preferredMode: preferredModeSchema,
    when: departureWhenSchema,
    departAt: z.string().datetime().optional(),
  })
  .refine((v) => v.when !== "later" || Boolean(v.departAt), {
    message: "departAt is required when when=later",
    path: ["departAt"],
  });

export type TripRequestInput = z.infer<typeof tripRequestSchema>;

// ---------------------------------------------------------------------------
// Saved routes
// ---------------------------------------------------------------------------

export const savedRouteInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  origin: z.string().trim().min(1, "Origin is required").max(160),
  destination: z.string().trim().min(1, "Destination is required").max(160),
  tripType: tripTypeSchema.default("local"),
  preferredMode: preferredModeSchema.default("driving"),
  favoriteBridge: z.string().max(120).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type SavedRouteInput = z.infer<typeof savedRouteInputSchema>;

// ---------------------------------------------------------------------------
// Alerts (admin)
// ---------------------------------------------------------------------------

export const alertInputSchema = z.object({
  titleEn: z.string().trim().min(1).max(160),
  titleEs: z.string().trim().min(1).max(160),
  bodyEn: z.string().trim().min(1).max(2000),
  bodyEs: z.string().trim().min(1).max(2000),
  category: alertCategorySchema,
  severity: alertSeveritySchema,
  affectedArea: z.string().trim().max(200).optional().nullable(),
  source: z.string().trim().min(1).max(160),
  sourceUrl: z.string().url().max(500).optional().or(z.literal("")).nullable(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
});

export type AlertInput = z.infer<typeof alertInputSchema>;

// ---------------------------------------------------------------------------
// Cooling centers (admin)
// ---------------------------------------------------------------------------

export const coolingCenterInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  type: coolingCenterTypeSchema,
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().max(40).optional().nullable(),
  website: z.string().url().max(500).optional().or(z.literal("")).nullable(),
  hoursEn: z.string().trim().max(200).optional().nullable(),
  hoursEs: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  source: z.string().trim().min(1).max(160),
  sourceUrl: z.string().url().max(500).optional().or(z.literal("")).nullable(),
  lastVerifiedAt: z.string().datetime().nullable().optional(),
  active: z.boolean().default(true),
});

export type CoolingCenterInput = z.infer<typeof coolingCenterInputSchema>;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().max(120).optional().nullable(),
  preferredLanguage: localeSchema.optional(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

/** Helper: turn a ZodError into a flat field->message map for forms/APIs. */
export function flattenZodError(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
