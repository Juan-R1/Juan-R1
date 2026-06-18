import { render, type RenderOptions } from "@testing-library/react";
import { I18nProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/types";
import type { ReactElement } from "react";

/** Render a component wrapped in the i18n provider used app-wide. */
export function renderWithProviders(
  ui: ReactElement,
  {
    locale = "en",
    ...options
  }: { locale?: Locale } & Omit<RenderOptions, "wrapper"> = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <I18nProvider initialLocale={locale}>{children}</I18nProvider>
    ),
    ...options,
  });
}
