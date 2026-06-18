"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Locale } from "@/lib/types";
import { translate, type TranslationKey } from "./dictionary";

const STORAGE_KEY = "cruceep.locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

export function I18nProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Hydrate from the user's explicit choice (localStorage) on mount. If none
  // exists, respect the server-provided `initialLocale` (e.g. a logged-in
  // user's saved preference); only fall back to the browser language for
  // first-time visitors with the default ("en") locale.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) {
        setLocaleState(stored);
        return;
      }
      if (initialLocale === "en") {
        const browser = navigator.language?.toLowerCase().startsWith("es")
          ? "es"
          : "en";
        setLocaleState(browser);
      }
      // else: keep the non-default server-provided initialLocale.
    } catch {
      // Ignore — fall back to initialLocale.
    }
  }, [initialLocale]);

  // Keep <html lang> in sync for accessibility + SEO.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode, etc.).
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "es" : "en");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(locale, key, vars),
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, setLocale, toggleLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

/** Convenience hook returning just the translate function. */
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}
