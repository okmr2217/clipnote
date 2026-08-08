"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "クリップ",
    isActive: (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/pages"),
  },
  {
    href: "/admin/collections",
    label: "コレクション",
    isActive: (pathname: string) => pathname.startsWith("/admin/collections"),
  },
  {
    href: "/admin/mcp",
    label: "MCP連携",
    isActive: (pathname: string) => pathname.startsWith("/admin/mcp"),
  },
  {
    href: "/admin/settings",
    label: "アカウント設定",
    isActive: (pathname: string) => pathname.startsWith("/admin/settings"),
  },
];

function initialsOf(source: string) {
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AdminHeader({ user }: { user: { name: string; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [renderedPathname, setRenderedPathname] = useState(pathname);
  const initials = initialsOf(user.name || user.email);

  // Reset the mobile menu when navigating, without an effect (React docs:
  // "Adjusting state based on a prop change" pattern).
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname);
    setMobileOpen(false);
  }

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-4 md:h-[68px] md:px-8">
        <div className="flex items-center gap-10">
          <Link href="/admin" className="text-lg font-extrabold tracking-tight md:text-xl">
            Clip<span className="text-primary">note</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-14 items-center border-b-2 text-sm md:h-[68px]",
                    active
                      ? "border-primary font-bold text-primary"
                      : "border-transparent font-semibold text-secondary-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden size-9 items-center justify-center rounded-full bg-secondary text-[13px] font-bold text-primary transition-colors data-popup-open:bg-primary data-popup-open:text-primary-foreground md:flex"
              aria-label="アカウントメニュー"
            >
              {initials}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={12} className="w-60 rounded-2xl p-4">
              <div className="mb-3 truncate text-[13px] font-semibold text-secondary-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator className="-mx-4 mb-3" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="rounded-lg px-0 py-0 text-sm font-bold text-primary focus:bg-transparent focus:text-primary"
              >
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-[12px] font-bold text-primary md:hidden"
          >
            {initials}
          </div>
          <button
            type="button"
            aria-label={mobileOpen ? "メニューを閉じる" : "メニューを開く"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
            className="flex size-9 items-center justify-center text-foreground md:hidden"
          >
            {mobileOpen ? <XIcon className="size-5 text-primary" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-4 md:hidden">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-xl px-2 py-3.5 text-[17px]",
                  active ? "bg-secondary font-bold text-primary" : "font-semibold text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="mt-3 border-t border-border pt-4">
            <div className="px-2 pb-3 text-[13px] font-medium text-muted-foreground">{user.email}</div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-2 py-3 text-[15px] font-bold text-primary"
            >
              ログアウト
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
