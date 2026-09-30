import { Order, OrderItem, OrderItemProduct } from "./types/order.types";
import { ReviewModalData } from "@/features/reviews/types/review.types";
import { formatMoney } from "@/lib/utils/currency";

export const orderTotal = (o: Order) => Number(o.total_amount ?? 0);
export const orderLabel = (o: Order) => o.order_number ?? `#${o.id.slice(0, 8).toUpperCase()}`;
export const orderMoney = (n: number) => formatMoney(n);

const isPaid = (o: Order) => ["paid", "captured", "success", "completed"].includes((o.payment_status ?? "").toLowerCase());

// Pending orders that haven't been paid can be paid again or cancelled.
export const canPayOrder = (o: Order) => o.status === "pending" && !isPaid(o);
export const canCancelOrder = canPayOrder;

// Order item images may be absolute URLs or paths relative to the media host (like cart images).
export const orderImageSrc = (image?: string | null) =>
  !image ? "" : /^https?:\/\//.test(image) ? image : `${process.env.NEXT_PUBLIC_IMAGE_URL ?? ""}${image}`;

// First value that parses to a real number, or null.
const firstNumber = (...values: unknown[]) => {
  for (const v of values) {
    if (v === null || v === undefined || v === "") continue;
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

const productOf = (it: OrderItem): OrderItemProduct | null =>
  it.product && typeof it.product === "object" ? it.product : null;

export const itemProductId = (it: OrderItem) =>
  it.product_id ?? (typeof it.product === "string" ? it.product : it.product?.id) ?? null;

export const itemName = (it: OrderItem) => it.product_name ?? productOf(it)?.name ?? "Product";

export const itemImage = (it: OrderItem) =>
  orderImageSrc(it.image ?? it.product_image ?? it.cover_image ?? productOf(it)?.cover_image ?? productOf(it)?.image);

export const itemUnitPrice = (it: OrderItem) =>
  firstNumber(
    it.price,
    it.unit_price,
    it.price_at_purchase,
    it.price_after_discount,
    it.product_price,
    productOf(it)?.price_after_discount,
    productOf(it)?.price
  );

export const itemTotal = (it: OrderItem) => {
  const direct = firstNumber(it.subtotal, it.total, it.line_total, it.total_price);
  if (direct !== null) return direct;
  const unit = itemUnitPrice(it);
  return unit === null ? null : unit * it.quantity;
};

// Shows a dash rather than "NaN" when the API doesn't send a value.
export const orderMoneyOrDash = (n: number | null) => (n === null ? "—" : orderMoney(n));

export const shippingCityLine = (o: Order) =>
  [o.shipping_city, [o.shipping_state, o.shipping_postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ");

// Money rows for a price breakdown; zero-value extras are hidden, shipping shows "Free" at zero.
export const orderCharges = (o: Order) =>
  [
    { label: "Subtotal", value: Number(o.subtotal ?? 0), show: true },
    { label: "Discount", value: -Math.abs(Number(o.discount ?? 0)), show: Number(o.discount ?? 0) !== 0 },
    { label: "Shipping", value: Number(o.shipping_fee ?? 0), show: true, freeWhenZero: true },
    { label: "Tax", value: Number(o.tax ?? 0), show: Number(o.tax ?? 0) !== 0 },
    { label: "Platform fee", value: Number(o.platform_fee ?? 0), show: Number(o.platform_fee ?? 0) !== 0 },
  ].filter((row) => row.show);

export const formatOrderDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export const isDelivered = (o: Order) => o.status.toLowerCase() === "delivered";

// Unique products on the order, in the shape the review modal expects.
export const reviewModalDataFor = (o: Order): ReviewModalData => {
  const seen = new Set<string>();
  const products: ReviewModalData["products"] = [];
  for (const it of o.items ?? []) {
    const productId = itemProductId(it);
    if (!productId || seen.has(productId)) continue;
    seen.add(productId);
    products.push({ productId, name: itemName(it), image: itemImage(it) });
  }
  return { orderId: o.id, orderLabel: orderLabel(o), products };
};
