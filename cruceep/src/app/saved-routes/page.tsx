"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState, ErrorState } from "@/components/states";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/components/auth-provider";
import { useSavedRoutes } from "@/lib/use-saved-routes";
import type { PreferredMode, SavedRoute, TripType } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const TRIP_TYPES: TripType[] = ["local", "cross_border", "transit", "heat_safe"];
const MODES: PreferredMode[] = ["driving", "walking", "sun_metro", "eta", "mixed"];

const QUICK_ADDS: { labelKey: TranslationKey; origin: string; destination: string }[] =
  [
    { labelKey: "saved.quickAdd.homeWork", origin: "Home", destination: "Work" },
    { labelKey: "saved.quickAdd.homeSchool", origin: "Home", destination: "School" },
    {
      labelKey: "saved.quickAdd.bridgeClinic",
      origin: "Bridge",
      destination: "Clinic",
    },
  ];

export default function SavedRoutesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { routes, status, add, remove } = useSavedRoutes();

  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [tripType, setTripType] = useState<TripType>("local");
  const [mode, setMode] = useState<PreferredMode>("driving");
  const [error, setError] = useState<string | null>(null);

  const canAdd = name.trim() && origin.trim() && destination.trim();

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    setError(null);
    try {
      await add({
        name: name.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        tripType,
        preferredMode: mode,
      });
      setName("");
      setOrigin("");
      setDestination("");
    } catch {
      setError(t("error.saveFailed"));
    }
  };

  const onQuickAdd = async (q: (typeof QUICK_ADDS)[number]) => {
    setError(null);
    try {
      await add({
        name: t(q.labelKey),
        origin: q.origin,
        destination: q.destination,
        tripType: "local",
        preferredMode: "driving",
      });
    } catch {
      setError(t("error.saveFailed"));
    }
  };

  const onDelete = async (route: SavedRoute) => {
    if (!window.confirm(t("saved.deleteConfirm"))) return;
    try {
      await remove(route.id);
    } catch {
      setError(t("error.generic"));
    }
  };

  return (
    <div>
      <PageHeader
        title={t("saved.title")}
        subtitle={t("saved.subtitle")}
        actions={
          <Badge variant={user ? "success" : "secondary"}>
            {user ? t("saved.syncedNote") : t("saved.localNote")}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Add form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">{t("saved.add")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_ADDS.map((q) => (
                <Button
                  key={q.labelKey}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickAdd(q)}
                >
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(q.labelKey)}
                </Button>
              ))}
            </div>

            <form onSubmit={onAdd} className="space-y-3">
              <div>
                <Label htmlFor="r-name">{t("saved.name")}</Label>
                <Input
                  id="r-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("saved.name.placeholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="r-origin">{t("plan.origin")}</Label>
                <Input
                  id="r-origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder={t("plan.origin.placeholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="r-dest">{t("plan.destination")}</Label>
                <Input
                  id="r-dest"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={t("plan.destination.placeholder")}
                  className="mt-1.5"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="r-type">{t("plan.tripType")}</Label>
                  <Select
                    id="r-type"
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
                  <Label htmlFor="r-mode">{t("plan.mode")}</Label>
                  <Select
                    id="r-mode"
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
              </div>
              <Button type="submit" className="w-full" disabled={!canAdd}>
                {t("saved.add")}
              </Button>
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div>
          {status === "loading" ? <LoadingState /> : null}
          {status === "error" ? <ErrorState message={t("error.generic")} /> : null}
          {status === "ready" && routes.length === 0 ? (
            <EmptyState title={t("saved.empty")} />
          ) : null}
          {status === "ready" && routes.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {routes.map((route) => (
                <li key={route.id}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{route.name}</p>
                          <p className="truncate text-sm text-muted-foreground">
                            {route.origin} → {route.destination}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge variant="outline">
                              {t(`plan.tripType.${route.tripType}` as TranslationKey)}
                            </Badge>
                            <Badge variant="secondary">
                              {t(`plan.mode.${route.preferredMode}` as TranslationKey)}
                            </Badge>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDelete(route)}
                          aria-label={t("common.delete")}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <Link
                        href={{
                          pathname: "/plan",
                          query: {
                            origin: route.origin,
                            destination: route.destination,
                            tripType: route.tripType,
                            preferredMode: route.preferredMode,
                          },
                        }}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "mt-3 w-full",
                        })}
                      >
                        {t("saved.openInPlanner")}
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
