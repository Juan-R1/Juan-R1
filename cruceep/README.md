# CruceEP

**Bilingual El Paso–Juárez mobility & border navigator.** Plan local and
cross-border trips in one place — compare international bridge wait times, check
Sun Metro / ETA transit options, see service & heat alerts, find cooling
centers, and save your frequent routes. English 🇺🇸 / Español 🇲🇽 from day one.

CruceEP is a **web-first PWA** built so it can later be wrapped into a native app
(Expo/Capacitor) without a rewrite. It is an **orchestration layer** over
official sources — it never pretends to replace them. Every dynamic card shows
its **source**, a **"last updated" timestamp**, and a **confidence badge**
(Live / Cached / Estimated / Sample data / Unavailable).

---

## Table of contents

- [What it does (MVP scope)](#what-it-does-mvp-scope)
- [Tech stack](#tech-stack)
- [Architecture overview](#architecture-overview)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Supabase setup (auth + database)](#supabase-setup-auth--database)
- [Migrations & seed data](#migrations--seed-data)
- [Running the dev server](#running-the-dev-server)
- [Running tests](#running-tests)
- [Deploying to Vercel](#deploying-to-vercel)
- [Replacing mock providers with live data](#replacing-mock-providers-with-live-data)
- [Data-source attribution rules](#data-source-attribution-rules)
- [Privacy approach](#privacy-approach)
- [Accessibility](#accessibility)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Project structure](#project-structure)

---

## What it does (MVP scope)

CruceEP helps a user answer, in one app:

1. **Which bridge should I use right now?** — `/bridges`
2. **What are the current bridge wait times?** — vehicle / Ready Lane / pedestrian per crossing
3. **What transit gets me closest?** — `/plan` (Sun Metro / ETA, estimated/beta)
4. **Are there service alerts or route changes?** — `/alerts`
5. **Is there heat/weather risk along the trip?** — heat-aware trip card
6. **Where are nearby cooling centers / safe places?** — `/cooling-centers`
7. **Can I save my common routes and check them later?** — `/saved-routes`

Implemented pages: **Home**, **Plan Trip**, **Bridges**, **Alerts**,
**Cooling Centers**, **Saved Routes**, **Login**, and a protected **Admin**
dashboard (cooling centers CRUD, manual alerts CRUD, data-source health).

The app **runs fully offline on mock providers** with zero configuration — no
Supabase and no map keys required to develop or demo. Add Supabase to enable
accounts, synced saved routes, and the admin dashboard.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 14** (App Router) + **TypeScript** |
| Styling | **Tailwind CSS** + a small shadcn-style component system (`src/components/ui`) |
| Icons | lucide-react |
| Validation | **Zod** (shared by API routes and forms) |
| Backend | **Supabase** (Postgres + Auth + RLS), optional |
| PWA | Web manifest + service worker (offline shell) |
| i18n | Lightweight custom dictionary + React context (no heavy dependency) |
| Tests | **Vitest** + Testing Library (unit/component), **Playwright** (e2e) |
| Maps | Provider-abstraction ready (Leaflet/OSM default, Mapbox/Google swappable) |

## Architecture overview

**Adapter / provider pattern.** All external data is read through interfaces so
the upstream source can change without touching the UI:

| Domain | Interface | Mock (default) | Future live adapter |
| --- | --- | --- | --- |
| Border waits | `BorderWaitProvider` | `MockBorderWaitProvider` | `CBPBorderWaitProvider` |
| Transit | `TransitProvider` | `MockTransitProvider` | `SunMetroGTFSProvider`, `ETAGTFSProvider` |
| Weather | `WeatherProvider` | `MockWeatherProvider` | `NWSWeatherProvider` |
| Alerts | `AlertProvider` | `MockAlertProvider` | `CompositeAlertProvider` |
| Cooling centers | `CoolingCenterProvider` | `MockCoolingCenterProvider` | Supabase-backed (admin) |

Each provider is selected at runtime by an environment variable
(`BORDER_WAIT_PROVIDER`, `TRANSIT_PROVIDER`, …) via a factory. Not-yet-implemented
live adapters **throw** instead of returning fake "live" data; API routes catch
that and degrade to the clearly-labeled mock so the UI never breaks.

**Service layer.** `src/lib/services/*` reads Supabase-first (alerts, cooling
centers) and falls back to mock only when Supabase is unavailable — it never
mixes sample data into real data, so an admin who clears a table sees an empty
state, not stale samples.

**Source attribution model.** Every dynamic value carries a `SourceAttribution`
(`source`, `sourceUrl`, `lastUpdated`, `confidence`) rendered by the shared
`<SourceLine />` + `<ConfidenceBadge />` components.

## Local setup

Prerequisites: **Node 18.18+** (Node 20/22 recommended) and npm.

```bash
cd cruceep
npm install
cp .env.example .env.local   # optional — app runs without any values
npm run dev                  # http://localhost:3000
```

That's it. With no `.env.local`, the app runs on mock providers and stores saved
routes in your browser.

## Environment variables

All are **optional**. See `.env.example` for the annotated template.

| Variable | Purpose | Default behavior if unset |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` / `APP_ENV` | Environment label (`development`/`demo`/`production`) | `development` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Auth/DB disabled; mock + localStorage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Auth/DB disabled |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for admin writes | Admin writes disabled |
| `NEXT_PUBLIC_MAP_PROVIDER` | `leaflet` \| `mapbox` \| `google` | `leaflet` (no key needed) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox token (if provider=mapbox) | — |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps key (if provider=google) | — |
| `BORDER_WAIT_PROVIDER` | `mock` \| `cbp` | `mock` |
| `TRANSIT_PROVIDER` | `mock` \| `sunmetro-gtfs` \| `eta-gtfs` | `mock` |
| `WEATHER_PROVIDER` | `mock` \| `nws` | `mock` |
| `ALERT_PROVIDER` | `mock` \| `composite` | `mock` |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never prefix it with
> `NEXT_PUBLIC_` and never expose it to the browser.

## Supabase setup (auth + database)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon key** (Settings → API) into `.env.local` as
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Copy the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY` (server-only).
4. Apply the schema and seed (next section).
5. Email/password auth is on by default. For magic links, ensure email is
   enabled under Authentication → Providers.

## Migrations & seed data

SQL lives in `supabase/`:

- `supabase/migrations/0001_init.sql` — tables, triggers, RLS policies, and a
  trigger that auto-creates a `profiles` row on signup.
- `supabase/seed.sql` — sample bridges, alerts, cooling centers, a few bridge
  wait snapshots, and baseline `data_source_health` rows.

**Option A — Supabase SQL editor:** paste `0001_init.sql`, run it, then paste
`seed.sql` and run it.

**Option B — Supabase CLI:**

```bash
supabase db push                      # or: psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/seed.sql
```

**Make yourself an admin** (after signing up once in the app):

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Tables: `profiles`, `saved_routes`, `bridges`, `bridge_wait_snapshots`,
`alerts`, `cooling_centers`, `data_source_health`.

## Running the dev server

```bash
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## Running tests

```bash
npm test           # Vitest unit + component tests (46+ tests, no network)
npm run test:watch # watch mode

# End-to-end (optional, needs a browser binary):
npx playwright install chromium
npm run test:e2e
```

Covered by tests: data adapters (mock providers, deterministic + peak logic),
utility functions, all Zod schemas, EN/ES dictionary parity, browser-local saved
routes, and key components (language toggle, confidence badge, bridge card). The
e2e spec walks the happy path: change language → check bridges → plan a trip →
save the route locally.

## Deploying to Vercel

This app lives in the `cruceep/` subdirectory of the repo.

1. Import the repo into Vercel.
2. **Set the project Root Directory to `cruceep`** (Project Settings → General).
3. Framework preset: **Next.js** (auto-detected). Build: `npm run build`.
4. Add the environment variables you use (at minimum the Supabase trio if you
   want auth/DB). Mark `SUPABASE_SERVICE_ROLE_KEY` as a server-side secret.
5. Deploy. The app works on Vercel with zero env vars (mock mode) too.

## Replacing mock providers with live data

Each mock has a documented seam. To go live:

- **CBP Border Wait Times** — implement `CBPBorderWaitProvider.getWaits()` in
  `src/lib/providers/border-wait.ts` (fetch `https://bwt.cbp.gov/`, map ports to
  our bridge ids, set `confidence: "live" | "cached"`), then set
  `BORDER_WAIT_PROVIDER=cbp`. Prefer a scheduled job that writes
  `bridge_wait_snapshots` rather than fragile request-time scraping.
- **Sun Metro / ETA GTFS** — implement `SunMetroGTFSProvider` / `ETAGTFSProvider`
  in `src/lib/providers/transit.ts`; set `TRANSIT_PROVIDER` accordingly.
- **NWS weather** — implement `NWSWeatherProvider` (api.weather.gov) in
  `src/lib/providers/weather.ts`; set `WEATHER_PROVIDER=nws`.
- **Alerts** — implement `CompositeAlertProvider` to merge official feeds; or
  manage alerts via the admin dashboard (stored in Supabase, served Supabase-first).

Scheduled ingestion (Supabase Edge Functions / cron) should update
`data_source_health` so the admin dashboard reflects real status.

## Data-source attribution rules

1. Every dynamic/semi-dynamic card shows **source**, **last updated**, and a
   **confidence badge**.
2. Confidence is one of `live`, `cached`, `estimated`, `mock`, `unavailable`.
3. **Mock/sample data is always labeled** ("Sample data" / "Datos de muestra")
   and never presented as official.
4. Estimates (trip routing) are marked **Beta / Estimated** with a disclaimer.
5. A site-wide footer states CruceEP is not affiliated with CBP, Sun Metro, ETA,
   NWS, or the City of El Paso, and to confirm with official sources.

## Privacy approach

- The app is useful **without an account** — saved routes default to browser
  storage. Accounts only add cross-device sync and admin access.
- We collect **no sensitive personal data**. There are **no immigration,
  identity, legal-status, or document workflows** — by design.
- RLS keeps each user's saved routes private to them; admin-managed tables are
  public-read for non-sensitive reference data only.

## Accessibility

Semantic HTML, labeled controls, `aria-current`/`aria-pressed` on nav and
toggles, visible focus rings, a skip-to-content link, screen-reader text on
icon-only buttons, native selects for mobile/AT compatibility, and color choices
aimed at WCAG AA contrast. Spanish strings are written to fit the same layouts.

## Known limitations

- Bridge waits, transit routing, and weather use **mock providers** by default;
  numbers are illustrative until live adapters are wired in.
- Trip routing is a **placeholder/beta** estimator, not a real routing engine.
- Cooling-center sample records are **unverified**; verify before relying on them.
- Maps are abstracted but the MVP ships **list-first** (no embedded map tiles yet).
- Admin writes require the Supabase **service role key** to be configured.

## Roadmap

- Live **CBP Border Wait Times** integration + predictive wait estimates
- **Sun Metro GTFS / GTFS-realtime** and **ETA GTFS** routing
- **NWS** live weather + heat advisories
- Push notifications (alerts, saved-route conditions)
- Native mobile wrapper (Expo/Capacitor)
- Parking (Park 915) and streetcar/event routing
- Partner/agency dashboard and B2B commuter/fleet dashboard

## Project structure

```
cruceep/
├─ src/
│  ├─ app/                # App Router pages + /api route handlers
│  ├─ components/         # UI kit, cards, layout chrome, admin, providers
│  ├─ lib/
│  │  ├─ providers/       # Adapter interfaces + mock & future implementations
│  │  ├─ services/        # Supabase-first reads with mock fallback
│  │  ├─ supabase/        # Browser/server/admin clients, config, mappers
│  │  ├─ i18n/            # EN/ES dictionary + React context
│  │  ├─ validation.ts    # Zod schemas
│  │  └─ types.ts         # Shared domain types
│  ├─ data/               # Seed/mock data (shared with SQL seed)
│  └─ tests/              # Vitest unit/component tests
├─ tests/e2e/             # Playwright happy-path spec
├─ supabase/              # SQL migrations + seed
└─ public/                # PWA manifest, service worker, icon, offline page
```

---

CruceEP is an independent community tool and is **not affiliated with** U.S.
Customs and Border Protection, Sun Metro, El Paso County ETA, the National
Weather Service, or the City of El Paso. Always confirm with official sources.
