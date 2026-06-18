"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signIn" | "signUp";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthEnabled } = useAuth();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isAuthEnabled) {
    return (
      <div>
        <PageHeader title={t("auth.signIn.title")} />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("auth.disabled")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(t("auth.disabled"));
      setBusy(false);
      return;
    }
    try {
      if (mode === "signUp") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        setMessage(t("auth.success"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/saved-routes");
        router.refresh();
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      setBusy(false);
    }
  };

  const onMagicLink = async () => {
    setError(null);
    setMessage(null);
    if (!email) {
      setError(t("auth.email"));
      return;
    }
    setBusy(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setBusy(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setMessage(t("auth.magicLinkSent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error.generic"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title={mode === "signIn" ? t("auth.signIn.title") : t("auth.signUp.title")}
      />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signUp" ? (
              <div>
                <Label htmlFor="displayName">{t("auth.displayName")}</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1.5"
                  autoComplete="name"
                />
              </div>
            ) : null}
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                autoComplete={
                  mode === "signUp" ? "new-password" : "current-password"
                }
                required
                minLength={6}
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="text-sm text-emerald-700" role="status">
                {message}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "signIn" ? t("auth.signIn") : t("auth.signUp")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onMagicLink}
              disabled={busy}
            >
              {t("auth.magicLink")}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
            className="mt-4 w-full text-center text-sm text-primary hover:underline"
          >
            {mode === "signIn"
              ? t("auth.toggleToSignUp")
              : t("auth.toggleToSignIn")}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
