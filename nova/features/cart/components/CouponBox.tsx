"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Loader2, Tag, TicketPercent, UserPlus, X } from "lucide-react";
import useAuthStore from "@/lib/globalstore/auth.store";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { useCoupons } from "@/features/coupons/hooks/useCoupons";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { WELCOME_COUPON_MODAL, availableCoupons, type WelcomeCouponModalData } from "@/features/coupons/hooks/useWelcomeCoupon";
import { Celebration, ConfettiPiece, makeConfetti } from "@/components/ui/Celebration";
import { formatMoney } from "@/lib/utils/currency";
import { useApplyCoupon, useRemoveCoupon } from "../hooks/useCoupon";
import { CartCoupon, CouponResponse } from "../types/cart.type";

const CODE_PATTERN = /^[A-Z0-9_-]{3,50}$/;

// "10% off" or "₹200 off", from the coupon's own terms.
export const couponOfferLabel = (c: Pick<CartCoupon, "discount_percentage" | "discount_amount">) =>
  Number(c.discount_percentage) > 0 ? `${Number(c.discount_percentage)}% off` : `${formatMoney(c.discount_amount)} off`;

// The POST may return the cart itself or `{ cart }`.
const cartFrom = (res: CouponResponse | undefined) => res?.cart ?? res;

type Props = {
  /** The cart's coupon from GET /cart/ (null when none). */
  coupon?: CartCoupon | null;
  /** What the coupon took off, from the cart API. */
  couponDiscount?: string | null;
  disabled?: boolean;
};

// Apply/remove a coupon via /cart/coupon/, with a confetti celebration on success.
export function CouponBox({ coupon, couponDiscount, disabled }: Props) {
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{ pieces: ConfettiPiece[]; title: string; subtitle?: string } | null>(null);
  const endCelebration = useCallback(() => setCelebration(null), []);

  const busy = disabled || applyCoupon.isPending || removeCoupon.isPending;

  // "View available codes": same coupon modal as the first-order welcome, with a neutral title.
  const { isAuthenticated } = useAuthStore();
  const { triggerModal } = useModalStore();
  const { data: allCoupons = [], isLoading: couponsLoading } = useCoupons(isAuthenticated);
  const { data: orders = [], isLoading: ordersLoading } = useOrders(isAuthenticated);
  const loadingCodes = isAuthenticated && (couponsLoading || ordersLoading);
  const viewCodes = () =>
    triggerModal(WELCOME_COUPON_MODAL, {
      coupons: availableCoupons(allCoupons, orders.length === 0),
      title: "Available coupons",
      subtitle: "Copy a code and paste it in the coupon box to save on this order.",
    } satisfies WelcomeCouponModalData);
  const saved = Number(couponDiscount ?? 0);

  const apply = () => {
    const value = code.trim().toUpperCase();
    if (!value) return setError("Enter a coupon code");
    if (!CODE_PATTERN.test(value)) return setError("That doesn't look like a valid code");
    setError(null);
    applyCoupon.mutate(
      { code: value },
      {
        onSuccess: (res) => {
          const cart = cartFrom(res);
          setCode("");
          // The API can accept the code but not apply it (e.g. minimum not met): explain instead of celebrating.
          if (cart?.coupon && !cart.coupon.is_applied) {
            setError(cart.coupon.message ?? "This code doesn't apply to your cart yet");
            return;
          }
          const amount = Number(cart?.coupon_discount ?? 0);
          setCelebration({
            pieces: makeConfetti(),
            title: `${cart?.coupon?.code ?? value} applied!`,
            subtitle: amount > 0 ? `You saved ${formatMoney(amount)} 🎉` : "Discount added to your order 🎉",
          });
        },
        // The API's message (e.g. "Coupon expired") also comes through as a toast.
        onError: (err) => setError((err as Error).message || "This code can't be applied"),
      }
    );
  };

  const remove = () => removeCoupon.mutate(undefined, { onSuccess: () => setError(null) });

  const removeButton = (label: string) => (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label={`Remove coupon ${label}`}
      className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-text-secondary hover:bg-card-background hover:text-error disabled:opacity-50"
    >
      {removeCoupon.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />} Remove
    </button>
  );

  return (
    <>
      <Celebration
        pieces={celebration?.pieces ?? null}
        title={celebration?.title ?? ""}
        subtitle={celebration?.subtitle}
        onDone={endCelebration}
      />

      {coupon ? (
        coupon.is_applied ? (
          <div className="mt-5 animate-scale-in rounded-xl border border-dashed border-success/50 bg-success/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/15 text-success">
                  <Tag className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-mono text-sm font-bold tracking-wide text-text-primary">{coupon.code}</span>
                    <span className="rounded-full bg-success/15 px-1.5 py-px text-[10px] font-bold uppercase text-success">
                      {couponOfferLabel(coupon)}
                    </span>
                  </span>
                  <span className="block text-[11px] font-medium text-success">
                    {saved > 0 ? `You save ${formatMoney(saved)} with this code` : "Coupon applied"}
                  </span>
                </span>
              </span>
              {removeButton(coupon.code)}
            </div>
            {coupon.only_for_new && (
              <p className="mt-2 flex items-center gap-1 text-[11px] text-text-muted">
                <UserPlus className="h-3 w-3" /> First-order offer
              </p>
            )}
          </div>
        ) : (
          // Attached but not currently applied: show why, and let the shopper drop it.
          <div className="mt-5 animate-fade-in rounded-xl border border-dashed border-warning/50 bg-warning/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
                  <AlertCircle className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-sm font-bold tracking-wide text-text-primary">{coupon.code}</span>
                  <span className="block text-[11px] font-medium text-warning">
                    {coupon.message ??
                      (Number(coupon.min_order_amount) > 0
                        ? `Needs an order of ${formatMoney(coupon.min_order_amount)} or more`
                        : "Not applied to this cart")}
                  </span>
                </span>
              </span>
              {removeButton(coupon.code)}
            </div>
          </div>
        )
      ) : (
        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Tag className="h-3.5 w-3.5" /> Coupon code
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => {
                // Don't let Enter submit a surrounding form (e.g. checkout).
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  apply();
                }
              }}
              placeholder="Enter code"
              maxLength={50}
              disabled={busy}
              aria-invalid={!!error}
              aria-label="Coupon code"
              className={`w-full rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-wide placeholder:font-sans placeholder:normal-case placeholder:tracking-normal focus:outline-none disabled:opacity-50 ${
                error ? "border-error focus:border-error" : "border-border focus:border-primary"
              }`}
            />
            <button
              type="button"
              onClick={apply}
              disabled={busy || !code.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {applyCoupon.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Apply
            </button>
          </div>
          {error && <p className="mt-1.5 animate-fade-in text-[11px] text-error">{error}</p>}
          {isAuthenticated && (
            <button
              type="button"
              onClick={viewCodes}
              disabled={loadingCodes}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline disabled:cursor-wait disabled:opacity-60"
            >
              {loadingCodes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TicketPercent className="h-3.5 w-3.5" />}
              View available codes
            </button>
          )}
        </div>
      )}
    </>
  );
}
