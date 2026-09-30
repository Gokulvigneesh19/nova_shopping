import { Coupon, CouponState, DiscountType } from "./types/coupon.types";
import { formatCurrency } from "@/features/admin/data/mock";

// A coupon is a percentage discount when discount_percentage is above 0; otherwise it's a fixed amount.
export const discountTypeOf = (c: Pick<Coupon, "discount_percentage">): DiscountType =>
  Number(c.discount_percentage ?? 0) > 0 ? "percentage" : "amount";

export const discountLabel = (c: Pick<Coupon, "discount_amount" | "discount_percentage">) =>
  discountTypeOf(c) === "amount"
    ? `${formatCurrency(Number(c.discount_amount))} off`
    : `${Number(c.discount_percentage ?? 0)}% off`;

// Same rules as the backend's `is_live`: active, started, and not yet ended.
export const couponState = (c: Coupon, now = Date.now()): CouponState => {
  if (!c.active) return "inactive";
  if (new Date(c.start_date).getTime() > now) return "scheduled";
  if (c.end_date && new Date(c.end_date).getTime() <= now) return "expired";
  return "live";
};

export const couponStateStyles: Record<CouponState, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-success/10 text-success" },
  scheduled: { label: "Scheduled", className: "bg-primary-blue/10 text-primary-blue" },
  expired: { label: "Expired", className: "bg-error/10 text-error" },
  inactive: { label: "Inactive", className: "bg-soft-background text-text-muted" },
};

// <input type="datetime-local"> works in local time without a zone; convert to/from ISO.
export const isoToLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const localInputToIso = (value: string) => (value ? new Date(value).toISOString() : null);

export const formatCouponDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
