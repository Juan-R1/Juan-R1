"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/layout/nav-icon";
import { useTranslation } from "@/lib/i18n/context";
import { BOTTOM_NAV_HREFS, NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

/** Thumb-reachable bottom navigation shown on mobile only. */
export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const items = BOTTOM_NAV_HREFS.map(
    (href) => NAV_ITEMS.find((i) => i.href === href)!
  ).filter(Boolean);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label={t("nav.menu")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <NavIcon name={item.icon} className="h-5 w-5" />
                <span className="max-w-full truncate px-0.5">
                  {t(item.labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
