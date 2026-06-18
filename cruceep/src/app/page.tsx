"use client";

import Link from "next/link";
import {
  Bell,
  Bookmark,
  Milestone,
  ShieldCheck,
  ThermometerSun,
  Bus,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const FEATURES: {
  icon: typeof Milestone;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}[] = [
  {
    icon: Milestone,
    titleKey: "landing.feature.bridges.title",
    bodyKey: "landing.feature.bridges.body",
  },
  {
    icon: Bus,
    titleKey: "landing.feature.transit.title",
    bodyKey: "landing.feature.transit.body",
  },
  {
    icon: ThermometerSun,
    titleKey: "landing.feature.alerts.title",
    bodyKey: "landing.feature.alerts.body",
  },
  {
    icon: Bookmark,
    titleKey: "landing.feature.routes.title",
    bodyKey: "landing.feature.routes.body",
  },
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-secondary/10 px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
          {t("app.tagline")}
        </p>
        <h1 className="mx-auto max-w-3xl text-balance text-3xl font-extrabold tracking-tight sm:text-5xl">
          {t("landing.hero.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          {t("landing.hero.subtitle")}
        </p>
        <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
          <Link href="/plan" className={buttonVariants({ size: "lg" })}>
            {t("landing.cta.plan")}
          </Link>
          <Link
            href="/bridges"
            className={buttonVariants({ size: "lg", variant: "secondary" })}
          >
            {t("landing.cta.bridges")}
          </Link>
          <Link
            href="/alerts"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            {t("landing.cta.alerts")}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, titleKey, bodyKey }) => (
          <Card key={titleKey}>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <CardTitle className="text-base">{t(titleKey)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t(bodyKey)}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Trust */}
      <section className="rounded-2xl border border-border bg-card px-6 py-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold">{t("landing.trust.title")}</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              {t("landing.trust.body")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/cooling-centers"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {t("nav.coolingCenters")}
              </Link>
              <Link
                href="/saved-routes"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                {t("nav.savedRoutes")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
