export interface AddToCartPayload {
  product: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  product: string;
  product_name: string;
  product_price: string;
  discount_percentage: string;
  price_after_discount: string;
  image: string;
  quantity: number;
  /** Line total after discount, calculated by the API. */
  total_price: string;
}

// Amounts are calculated by the API; the UI never recomputes them.
export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  /** Sum of original prices (before discount). */
  subtotal: string;
  discount: string;
  /** What the customer pays: subtotal − discount. */
  cart_amount: string;
  /** Coupon attached to the cart; `is_applied` is false when it no longer qualifies (see `message`). */
  coupon?: CartCoupon | null;
  /** Amount the coupon takes off, already reflected in `cart_amount`. */
  coupon_discount?: string | null;
}

export interface CartCoupon {
  code: string;
  discount_percentage: string;
  discount_amount: string;
  min_order_amount: string;
  only_for_new: boolean;
  is_applied: boolean;
  /** Why it isn't applied (e.g. minimum not met), or null. */
  message: string | null;
}

export interface ApplyCouponPayload {
  code: string;
}

// The coupon endpoint may return the updated cart itself, or wrap it.
export interface CouponResponse extends Partial<Cart> {
  message?: string;
  cart?: Cart;
}

export interface CartResponse {
  message: string;
  cart: Cart;
}
