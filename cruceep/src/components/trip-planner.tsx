"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BookmarkPlus, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HeatCard } from "@/components/heat-card";
import { AlertCard } from "@/components/cards/alert-card";
import { SourceLine } from "@/components/source-line";
import { LoadingState, ErrorState } from "@/components/states";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/components/auth-provider";
import { useSavedRoutes } from "@/lib/use-saved-routes";
import { apiFetch } from "@/lib/client-api";
import type {
  PreferredMode,
  ServiceAlert,
  TripPlan,
  TripType,
  WeatherSnapshot,
} from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

interface PlanResponse {
  plan: TripPlan;
  weather: WeatherSnapshot;
  alerts: ServiceAlert[];
  provider: string;
}

const TRIP_TYPES: TripType[] = ["local", "cross_border", "transit", "heat_safe"];
const MODES: PreferredMode[] = ["driving", "walking", "sun_metro", "eta", "mixed"];

const LEG_LABEL: Record<string, TranslationKey> = {
  walk: "plan.leg.walk",
  bus: "plan.leg.bus",
  brt: "plan.leg.brt",
  drive: "plan.leg.drive",
  border: "plan.leg.border",
  wait: "plan.leg.wait",
};

export function TripPlanner() {
  const { t } = useTranslation();
  const params = useSearchParams();
  const { user } = useAuth();
  const { add } = useSavedRoutes();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("local");
  const [mode, setMode] = useState<PreferredMode>("driving");
  const [when, setWhen] = useState<"now" | "later">("now");

  const [result, setResult] = useState<PlanResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  // Prefill from query params (e.g. "Open in planner" from saved routes).
  useEffect(() => {
    const o = params.get("origin");
    const d = params.get("destination");
    const tt = params.get("tripType") as TripType | null;
    const m = params.get("preferredMode") as PreferredMode | null;
    if (o) setOrigin(o);
    if (d) setDestination(d);
    if (tt && TRIP_TYPES.includes(tt)) setTripType(tt);
    if (m && MODES.includes(m)) setMode(m);
  }, [params]);

  const canSubmit = origin.trim().length > 0 && destination.trim().length > 0;

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;
      setStatus("loading");
      setSaveState("idle");
      try {
        const res = await apiFetch<PlanResponse>("/api/trip-plan", {
          method: "POST",
          body: JSON.stringify({
            origin: origin.trim(),
            destination: destination.trim(),
            tripType,
            preferredMode: mode,
            when,
            ...(when === "later"
              ? { departAt: new Date(Date.now() + 3600_000).toISOString() }
              : {}),
          }),
        });
        setResult(res);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    },
    [canSubmit, origin, destination, tripType, mode, when]
  );

  const onSave = useCallback(async () => {
    setSaveState("saving");
    try {
      await add({
        name: `${origin.trim()} → ${destination.trim()}`,
        origin: origin.trim(),
        destination: destination.trim(),
        tripType,
        preferredMode: mode,
        favoriteBridge: result?.plan.suggestedBridgeId ?? null,
      });
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, [add, origin, destination, tripType, mode, result]);

  const totalLabel = useMemo(() => {
    if (!result) return "";
    return `${result.plan.totalMinutes} ${t("common.minutes")}`;
  }, [result, t]);

  return (
    <div>
      <PageHeader title={t("plan.title")} subtitle={t("plan.subtitle")} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Form */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="origin">{t("plan.origin")}</Label>
                <Input
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={t("plan.origin.placeholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="destination">{t("plan.destination")}</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t("plan.destination.placeholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tripType">{t("plan.tripType")}</Label>
                <Select
                  id="tripType"
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value as TripType)}
                  className="mt-1.5"
                >
                  {TRIP_TYPES.map((tt) => (
                    <option key={tt} value={tt}>
                      {t(`plan.tripType.${tt}` as TranslationKey)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="mode">{t("plan.mode")}</Label>
                <Select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as PreferredMode)}
                  className="mt-1.5"
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {t(`plan.mode.${m}` as TranslationKey)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="when">{t("plan.when")}</Label>
                <Select
                  id="when"
                  value={when}
                  onChange={(e) => setWhen(e.target.value as "now" | "later")}
                  className="mt-1.5"
                >
                  <option value="now">{t("plan.when.now")}</option>
                  <option value="later">{t("plan.when.later")}</option>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {t("plan.submit")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="space-y-4">
          {status === "idle" ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                {t("plan.empty")}
              </CardContent>
            </Card>
          ) : null}

          {status === "loading" ? <LoadingState /> : null}
          {status === "error" ? (
            <ErrorState message={t("error.generic")} onRetry={() => setStatus("idle")} />
          ) : null}

          {status === "ready" && result ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle>{t("plan.result.title")}</CardTitle>
                    {result.plan.beta ? (
                      <Badge variant="warning">{t("common.beta")}</Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {t("plan.result.totalTime")}
                      </p>
                      <p className="text-2xl font-bold">{totalLabel}</p>
                    </div>
                    {result.plan.suggestedBridgeName ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {t("plan.result.suggestedBridge")}
                        </p>
                        <p className="text-lg font-semibold">
                          {result.plan.suggestedBridgeName}
                        </p>
                        {result.plan.estimatedBridgeWaitMinutes != null ? (
                          <p className="text-sm text-muted-foreground">
                            {t("plan.result.bridgeWait")}:{" "}
                            {result.plan.estimatedBridgeWaitMinutes}{" "}
                            {t("common.minutes")}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">
                      {t("plan.result.steps")}
                    </p>
                    <ol className="space-y-2">
                      {result.plan.legs.map((leg, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                        >
                          <span className="flex items-center gap-2">
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {i + 1}
                            </span>
                            <span>
                              {LEG_LABEL[leg.kind]
                                ? t(LEG_LABEL[leg.kind])
                                : leg.label}
                              {leg.line ? (
                                <span className="text-muted-foreground">
                                  {" "}
                                  · {leg.line}
                                </span>
                              ) : null}
                            </span>
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {leg.durationMinutes} {t("common.minutes")}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                    {t("plan.result.betaNote")}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={onSave}
                      disabled={saveState === "saving" || saveState === "saved"}
                    >
                      {saveState === "saved" ? (
                        <>
                          <Check className="h-4 w-4" aria-hidden="true" />
                          {t("common.saved")}
                        </>
                      ) : (
                        <>
                          <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
                          {t("plan.result.saveRoute")}
                        </>
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {user ? t("saved.syncedNote") : t("saved.localNote")}
                    </span>
                    {saveState === "error" ? (
                      <span className="text-xs text-destructive" role="alert">
                        {t("error.saveFailed")}
                      </span>
                    ) : null}
                  </div>

                  <SourceLine
                    source={result.plan.attribution.source}
                    lastUpdated={result.plan.attribution.lastUpdated}
                    confidence={result.plan.attribution.confidence}
                  />
                </CardContent>
              </Card>

              <HeatCard weather={result.weather} />

              {result.alerts.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">{t("alerts.title")}</h2>
                  {result.alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
