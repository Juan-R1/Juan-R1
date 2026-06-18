"use client";

import {
  Bell,
  Bookmark,
  Home,
  Map,
  Milestone,
  Shield,
  Snowflake,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Home,
  Map,
  Milestone,
  Bell,
  Snowflake,
  Bookmark,
  Shield,
};

/** Resolve a lucide icon by name (used by nav definitions). */
export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Map;
  return <Icon className={className} aria-hidden="true" />;
}
