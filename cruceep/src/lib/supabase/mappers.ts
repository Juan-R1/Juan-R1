import type {
  CoolingCenter,
  DataSourceHealth,
  SavedRoute,
  ServiceAlert,
} from "@/lib/types";

/** Map a snake_case `alerts` row into the camelCase ServiceAlert shape. */
export function mapAlertRow(row: Record<string, any>): ServiceAlert {
  return {
    id: row.id,
    titleEn: row.title_en,
    titleEs: row.title_es,
    bodyEn: row.body_en,
    bodyEs: row.body_es,
    category: row.category,
    severity: row.severity,
    affectedArea: row.affected_area ?? undefined,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    startsAt: row.starts_at ?? null,
    endsAt: row.ends_at ?? null,
    lastUpdated: row.updated_at ?? row.created_at,
    confidence: "live",
  };
}

export function mapCoolingCenterRow(row: Record<string, any>): CoolingCenter {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    address: row.address,
    phone: row.phone ?? null,
    website: row.website ?? null,
    hoursEn: row.hours_en ?? null,
    hoursEs: row.hours_es ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    source: row.source,
    sourceUrl: row.source_url ?? null,
    lastVerifiedAt: row.last_verified_at ?? null,
    active: row.active ?? true,
  };
}

export function mapSavedRouteRow(row: Record<string, any>): SavedRoute {
  return {
    id: row.id,
    userId: row.user_id ?? null,
    name: row.name,
    origin: row.origin,
    destination: row.destination,
    tripType: row.trip_type ?? "local",
    preferredMode: row.preferred_mode ?? "driving",
    favoriteBridge: row.favorite_bridge ?? null,
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDataSourceHealthRow(row: Record<string, any>): DataSourceHealth {
  return {
    id: row.id,
    sourceName: row.source_name,
    status: row.status,
    lastSuccessAt: row.last_success_at ?? null,
    lastFailureAt: row.last_failure_at ?? null,
    lastError: row.last_error ?? null,
    metadata: row.metadata ?? undefined,
    updatedAt: row.updated_at,
  };
}
