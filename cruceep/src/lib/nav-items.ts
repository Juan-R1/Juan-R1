import type { TranslationKey } from "@/lib/i18n/dictionary";

export interface NavItem {
  href: string;
  labelKey: TranslationKey;
  /** lucide-react icon name resolved in the nav component. */
  icon: string;
  /** Show only in the primary (top) nav, not the compact bottom bar. */
  topOnly?: boolean;
  /** Only render for admins. */
  adminOnly?: boolean;
}

/** Primary navigation shown across the app. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: "Home" },
  { href: "/plan", labelKey: "nav.plan", icon: "Map" },
  { href: "/bridges", labelKey: "nav.bridges", icon: "Milestone" },
  { href: "/alerts", labelKey: "nav.alerts", icon: "Bell" },
  { href: "/cooling-centers", labelKey: "nav.coolingCenters", icon: "Snowflake" },
  { href: "/saved-routes", labelKey: "nav.savedRoutes", icon: "Bookmark" },
  { href: "/admin", labelKey: "nav.admin", icon: "Shield", adminOnly: true },
];

/** Items used by the compact mobile bottom bar (max 5 for thumb reach). */
export const BOTTOM_NAV_HREFS = ["/", "/plan", "/bridges", "/alerts", "/saved-routes"];
