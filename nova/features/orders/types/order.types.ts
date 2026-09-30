// Known statuses get dedicated styling; anything else from the API still renders.
export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "packed"
  | "in_transit"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed"
  | (string & {});

// Product details may be embedded in the order item.
export interface OrderItemProduct {
  id?: string;
  name?: string;
  image?: string | null;
  cover_image?: string | null;
  price?: string | number;
  price_after_discount?: string | number;
}

// The API's exact field names vary, so every price/image field is optional; read them via utils.
export interface OrderItem {
  id: string;
  product?: string | OrderItemProduct | null;
  product_id?: string;
  product_name?: string;
  image?: string | null;
  product_image?: string | null;
  cover_image?: string | null;
  quantity: number;
  price?: string | number | null;
  unit_price?: string | number | null;
  product_price?: string | number | null;
  price_after_discount?: string | number | null;
  price_at_purchase?: string | number | null;
  subtotal?: string | number | null;
  total?: string | number | null;
  total_price?: string | number | null;
  line_total?: string | number | null;
}

// Mirrors the backend order serializer fields.
export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: string | null;
  shipping_name: string;
  shipping_phone_number: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: string;
  discount: string;
  shipping_fee: string;
  tax: string;
  platform_fee: string;
  total_amount: string;
  customer_note: string | null;
  items: OrderItem[];
  payment: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  currency?: string;
}

// What the API hands back for opening Razorpay Checkout.
export interface RazorpayOrderData {
  key?: string;
  key_id?: string;
  order_id?: string;
  razorpay_order_id?: string;
  id?: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface CheckoutPayload {
  address_id?: string;
  customer_note?: string;
}

export interface PaymentStartResponse {
  message?: string;
  order: Order;
  razorpay: RazorpayOrderData;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentFailedPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  reason: string;
}

export interface OrderResponse {
  message?: string;
  order: Order;
}
