"use client";

import { useEffect } from "react";
import useAuthStore from "@/lib/globalstore/auth.store";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { useCoupons } from "./useCoupons";
import { couponState } from "../utils";
import { Coupon } from "../types/coupon.types";

export const WELCOME_COUPON_MODAL = "welcomeCoupon";
export type WelcomeCouponModalData = {
  coupons: Coupon[];
  /** Defaults to the first-order welcome copy. */
  title?: string;
  subtitle?: string;
};

// Codes the shopper can use now; first-order-only codes are included only when they have no orders.
export const availableCoupons = (coupons: Coupon[], isFirstOrder: boolean) =>
  coupons.filter((c) => couponState(c) === "live" && (!c.only_for_new || isFirstOrder));

// Shown once per user per browser, so it doesn't nag on every visit.
const SHOWN_KEY = "novashop:welcomeCouponShown";
const alreadyShown = (userId: string) => {
  try {
    return (JSON.parse(localStorage.getItem(SHOWN_KEY) ?? "[]") as string[]).includes(userId);
  } catch {
    return false;
  }
};
const markShown = (userId: string) => {
  try {
    const list = JSON.parse(localStorage.getItem(SHOWN_KEY) ?? "[]") as string[];
    localStorage.setItem(SHOWN_KEY, JSON.stringify([...new Set([...list, userId])]));
  } catch {
    // Storage unavailable; the modal may show again next visit, which is harmless.
  }
};

// First-order shoppers (no orders yet) get a modal with the live "new customers only" coupons.
export function useWelcomeCouponPrompt(enabled: boolean = true) {
  const { isAuthenticated, userProfile } = useAuthStore();
  const { triggerModal } = useModalStore();
  const active = enabled && isAuthenticated && !!userProfile?.id;

  const { data: orders, isSuccess: ordersLoaded } = useOrders(active);
  const { data: coupons, isSuccess: couponsLoaded } = useCoupons(active);

  useEffect(() => {
    if (!active || !ordersLoaded || !couponsLoaded || !userProfile?.id) return;
    if ((orders ?? []).length > 0 || alreadyShown(userProfile.id)) return;
    const offers = availableCoupons(coupons ?? [], true).filter((c) => c.only_for_new);
    if (!offers.length) return;
    markShown(userProfile.id);
    triggerModal(WELCOME_COUPON_MODAL, { coupons: offers } satisfies WelcomeCouponModalData);
  }, [active, ordersLoaded, couponsLoaded, orders, coupons, userProfile?.id, triggerModal]);
}
