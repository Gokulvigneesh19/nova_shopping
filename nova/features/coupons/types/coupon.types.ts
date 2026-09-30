// Mirrors the backend Coupon model. Decimals arrive as strings, dates as ISO strings.
export interface Coupon {
  id: string;
  code: string;
  description: string;
  /** One of these is above 0; the other is "0.00". A 0 percentage means it's a fixed-amount coupon. */
  discount_percentage: string | null;
  discount_amount: string | null;
  /** Order subtotal needed before the code can be used ("0.00" = no minimum). */
  min_order_amount: string;
  start_date: string;
  /** null = never expires. */
  end_date: string | null;
  active: boolean;
  /** Only customers who haven't ordered before can use it. */
  only_for_new: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponPayload {
  code: string;
  description: string;
  discount_percentage: string | number;
  discount_amount: string | number;
  min_order_amount: string;
  start_date: string;
  end_date: string | null;
  active: boolean;
  only_for_new: boolean;
}

export type DiscountType = "percentage" | "amount";

export type CouponState = "live" | "scheduled" | "expired" | "inactive";
