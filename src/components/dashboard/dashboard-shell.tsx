// Dashboard shell: sidebar navigation, mobile nav, and shard display.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  Gem,
  Home,
  Leaf,
  PanelLeft,
  PanelLeftClose,
  User,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStats } from "@/contexts/user-stats-context";
import { formatWithCommas } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/study", label: "Study", icon: BookOpen },
  { href: "/dashboard/garden", label: "Garden", icon: Leaf },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed?: boolean;
  layout: "sidebar" | "mobile";
}

/**
 * Renders a single nav link for sidebar or mobile bottom bar.
 */
function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  layout,
}: NavLinkProps) {
  if (layout === "mobile") {
    return (
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="size-5" strokeWidth={active ? 2.25 : 2} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper with collapsible sidebar and mobile bottom navigation.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { shards } = useUserStats();

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "hidden md:flex shrink-0 flex-col border-r border-border bg-background-secondary transition-[width] duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 flex-col border-b border-border",
            collapsed ? "items-center px-2 py-3" : "px-4 py-3"
          )}
        >
          <div
            className={cn(
              "flex w-full items-center",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            {!collapsed && (
              <span className="font-semibold tracking-tight">Crescia</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((c) => !c)}
              className="text-muted-foreground"
            >
              {collapsed ? (
                <PanelLeft className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </div>
          {!collapsed && (
            <div
              className="mt-2 flex items-center gap-2 text-sm font-medium tabular-nums"
              title="Shard balance"
            >
              <Gem
                className="size-4 shrink-0 text-[#C9A84C]"
                aria-hidden
              />
              <span>{formatWithCommas(shards)}</span>
            </div>
          )}
          {collapsed && (
            <div
              className="mt-2 flex flex-col items-center gap-0.5"
              title={`${formatWithCommas(shards)} shards`}
            >
              <Gem
                className="size-4 shrink-0 text-[#C9A84C]"
                aria-hidden
              />
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              layout="sidebar"
              collapsed={collapsed}
              active={isNavActive(pathname, item.href)}
            />
          ))}
        </nav>

        <div
          className={cn(
            "flex shrink-0 border-t border-border p-3",
            collapsed ? "justify-center" : "px-4"
          )}
        >
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-background-secondary md:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            layout="mobile"
            active={isNavActive(pathname, item.href)}
          />
        ))}
      </nav>
    </div>
  );
}
