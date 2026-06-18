"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { NavIcon } from "@/components/layout/nav-icon";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/components/auth-provider";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, isAuthEnabled, signOut } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            C
          </span>
          <span className="text-lg">{t("app.name")}</span>
        </Link>

        <nav
          aria-label={t("nav.menu")}
          className="hidden items-center gap-1 lg:flex"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <NavIcon name={item.icon} className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {isAuthEnabled ? (
            user ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span className="max-w-[10rem] truncate">
                    {user.displayName || user.email}
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t("nav.signOut")}</span>
                </Button>
              </div>
            ) : (
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
