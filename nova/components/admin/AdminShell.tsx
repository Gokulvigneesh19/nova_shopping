"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tags,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { auth } from "@/lib/auth";
import useAuthStore from "@/lib/globalstore/auth.store";
import { resetAllStores } from "@/lib/utils/reset";

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag},
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/reviews", label: "Reviews & ratings", icon: Star },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/products/new": "Add product",
  "/admin/categories": "Categories",
  "/admin/categories/new": "Add category",
  "/admin/coupons": "Coupons",
  "/admin/reviews": "Reviews & ratings",
  "/admin/customers": "Customers",
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  // proxy.ts handles full requests; this catches cookies cleared client-side (e.g. a 401 logout) on the next navigation.
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    } else if (!auth.isAdmin()) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const handleLogout = () => {
    logout();
    resetAllStores();
    router.replace("/admin/login");
  };

  const name = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : "Admin";
  const initial = name[0]?.toUpperCase() ?? "A";

  if (!checked) {
    return (
      <div className="flex flex-1 items-center justify-center bg-soft-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 bg-soft-background">
      {/* Mobile backdrop */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-text-primary/40 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card-background transition-transform duration-300 ease-brand lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-lg shadow-primary/30">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-text-primary">
              Nova<span className="text-primary">Admin</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-text-muted hover:bg-hover-bg hover:text-primary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Menu</p>
          {navItems.map(({ href, label, icon: Icon, badge }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-linear-to-r from-gradient-start to-gradient-end text-white shadow-md shadow-primary/25"
                    : "text-text-secondary hover:bg-hover-bg hover:text-primary"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      active ? "bg-white/20 text-white" : "bg-hover-bg text-primary"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover-bg hover:text-primary"
          >
            <Store className="h-4.5 w-4.5" />
            View storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card-background/80 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-text-secondary hover:bg-hover-bg hover:text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">{pageTitles[pathname] ??
              (pathname.endsWith("/preview")
                ? "Preview product"
                : pathname.endsWith("/edit")
                  ? pathname.startsWith("/admin/categories") ? "Edit category" : "Edit product"
                  : "Admin")}</h1>

          <div className="relative ml-auto hidden w-full max-w-xs md:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search orders, products…"
              className="w-full rounded-full border border-border bg-soft-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <button
            aria-label="Notifications"
            className="relative ml-auto rounded-full p-2 text-text-secondary hover:bg-hover-bg hover:text-primary md:ml-0"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-card-background" />
          </button>

          <div className="flex items-center gap-2.5 border-l border-border pl-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-gradient-start to-gradient-end text-sm font-semibold text-white">
              {initial}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-text-primary">{name}</p>
              <p className="text-xs text-text-muted">Administrator</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
