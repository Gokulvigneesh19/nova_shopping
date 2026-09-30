"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useModalStore } from "@/lib/globalstore/modal.store";
import useAuthStore from "@/lib/globalstore/auth.store";
import useShopFilterStore from "@/lib/globalstore/shopFilter.store";
import { SearchIcon, ShoppingCartIcon, SlidersHorizontal, UserIcon, X } from "lucide-react";
import { getCookie } from "@/lib/utils/cookies";
import { useCartCount, useProfile } from "@/features/auth/hook/profile.hook";
import useCartStore from "@/lib/globalstore/cart.store";
import { resetAllStores } from "@/lib/utils/reset";
import { FILTER_MODAL } from "@/features/products/components/FilterModal";

const iconBtn =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover-bg hover:text-primary";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, setCartCount } = useCartStore();
  const { search, setSearch, category, maxPrice, sort } = useShopFilterStore();

  const authToken = getCookie("appToken");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Stay expanded while there's an active query so it's never hidden.
  const searchExpanded = searchOpen || !!search;

  const openSearch = () => {
    setSearchOpen(true);
    searchInputRef.current?.focus();
  };
  const { triggerModal } = useModalStore();
  const { isAuthenticated, userProfile, logout, login } = useAuthStore();

  const { data: userProfileData } = useProfile(isAuthenticated);
  const { data: cartCountData } = useCartCount();

  const justAdded = userProfileData?.user?.cart_count ?? 0;
  const firstNameInitial = (
    userProfile?.first_name ?? ""
  )?.[0]?.toUpperCase();
  const filtersActive = category !== null || maxPrice !== null || sort !== undefined;

  // Products are listed on the home page, so searching/filtering from elsewhere goes there.
  const goHome = () => {
    if (pathname !== "/") router.push("/");
  };

  const profileMenuItems = [
    {
      label: "My orders",
      onClick: () => router.push("/orders"),
    },
    {
      label: "Track order",
      onClick: () => router.push("/track-order"),
    },
    {
      label: "Logout",
      onClick: () => {
        logout();
        resetAllStores();
        // Full reload so every cached query and in-memory state from the session is dropped.
        window.location.replace("/");
      },
    },
  ];

  useEffect(() => {
    if (!profileMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!authToken) {
      logout();
    } else {
      login(userProfileData?.user ?? null)
    }
  }, [authToken, userProfileData]);

  useEffect(() => {
    if (cartCountData?.count !== undefined) {
      setCartCount(cartCountData.count);
    }
  }, [cartCountData]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 rounded-2xl border border-border bg-card-background/80 px-2.5 shadow-sm shadow-primary/5 backdrop-blur-xl sm:gap-4 sm:px-4">
        <Link href="/" aria-label="NovaShop home" className="flex shrink-0 items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-sm shadow-primary/30">
            N
          </span>
          <span className="hidden text-text-primary sm:inline">
            Nova<span className="text-primary">Shop</span>
          </span>
        </Link>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            goHome();
          }}
          className={`relative ml-auto h-9 min-w-0 transition-[width] duration-300 ease-out ${searchExpanded ? "w-full sm:w-80 lg:w-96" : "w-9"}`}
        >
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search"
            aria-expanded={searchExpanded}
            tabIndex={searchExpanded ? -1 : 0}
            className={`absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center rounded-full transition-colors ${searchExpanded ? "pointer-events-none text-text-muted" : "text-text-secondary hover:bg-hover-bg hover:text-primary"}`}
          >
            <SearchIcon className="h-4 w-4" />
          </button>
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            tabIndex={searchExpanded ? 0 : -1}
            onChange={(e) => {
              setSearch(e.target.value);
              goHome();
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            onKeyDown={(e) => {
              if (e.key !== "Escape") return;
              if (search) {
                setSearch("");
              } else {
                setSearchOpen(false);
                e.currentTarget.blur();
              }
            }}
            placeholder="Search products..."
            aria-label="Search products"
            className={`h-full w-full rounded-full border border-border bg-soft-background pl-10 pr-9 text-sm text-text-primary placeholder:text-text-muted transition-all duration-300 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:appearance-none ${searchExpanded ? "opacity-100" : "pointer-events-none opacity-0"}`}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                searchInputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-hover-bg hover:text-primary animate-scale-in"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              goHome();
              triggerModal(FILTER_MODAL);
            }}
            aria-label="Filters"
            className={`${iconBtn} ${filtersActive ? "bg-hover-bg text-primary" : ""}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {filtersActive && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card-background" />
            )}
          </button>

          <Link href="/cart" aria-label="Cart" className={iconBtn}>
            <ShoppingCartIcon className="h-4 w-4" />
            {cartCount > 0 && (
              <span
                key={cartCount}
                className={`absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-linear-to-br from-gradient-start to-gradient-end px-1 text-[10px] font-bold text-white ${justAdded ? "animate-bounce-once" : ""
                  }`}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => triggerModal("login")}
              aria-label="Account"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft-background text-text-secondary transition-colors hover:bg-hover-bg hover:text-primary"
            >
              <UserIcon className="h-4 w-4" />
            </button>
          ) : (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                aria-label="Account"
                aria-expanded={profileMenuOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-gradient-start to-gradient-end text-sm font-semibold text-white"
              >
                {firstNameInitial ?? <UserIcon className="h-4 w-4" />}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full z-10 mt-3 w-44 overflow-hidden rounded-xl border border-border bg-card-background shadow-lg animate-scale-in">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => { item.onClick(); setProfileMenuOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-hover-bg hover:text-primary"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
