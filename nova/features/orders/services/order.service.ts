import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import {
  CheckoutPayload,
  Order,
  OrderResponse,
  PaymentFailedPayload,
  PaymentStartResponse,
  VerifyPaymentPayload,
} from "@/features/orders/types/order.types";

type OrderListResponse = Order[] | { message?: string; orders?: Order[]; results?: Order[]; data?: Order[] };
type OrderDetailResponse = Order | { message?: string; order?: Order; data?: Order };

const orderUrl = (id: string, action = "") => `${API.users.orders}${id}/${action ? `${action}/` : ""}`;

// The API may return a bare array or wrap it; normalise to Order[].
const toOrderList = (res: OrderListResponse) => (Array.isArray(res) ? res : (res.orders ?? res.results ?? res.data ?? []));

// Customer: the signed-in user's own orders.
export const getOrders = async (signal?: AbortSignal): Promise<Order[]> =>
  toOrderList(await request<OrderListResponse>(API.users.orders, { method: "GET", signal }));

// Admin: every order in the store.
export const getAdminOrders = async (signal?: AbortSignal): Promise<Order[]> =>
  toOrderList(await request<OrderListResponse>(API.admin.orders, { method: "GET", signal }));

export const getOrder = async (id: string, signal?: AbortSignal): Promise<Order> => {
  const res = await request<OrderDetailResponse>(orderUrl(id), { method: "GET", signal });
  if ("id" in res) return res;
  const order = res.order ?? res.data;
  if (!order) throw new Error("Order not found");
  return order;
};

// Step 2: creates the order from the cart and returns the Razorpay order to pay.
export const checkoutOrder = (payload: CheckoutPayload) =>
  request<PaymentStartResponse, CheckoutPayload>(API.users.ordersCheckout, { method: "POST", body: payload });

// Step 4a: called from Razorpay's success handler.
export const verifyPayment = (payload: VerifyPaymentPayload) =>
  request<OrderResponse, VerifyPaymentPayload>(API.users.verifyPayment, { method: "POST", body: payload });

// Step 4b: called from Razorpay's `payment.failed` event.
export const reportPaymentFailed = (payload: PaymentFailedPayload) =>
  request<OrderResponse, PaymentFailedPayload>(API.users.paymentFailed, { method: "POST", body: payload });

// "Pay now" on a pending order: returns a fresh Razorpay order.
export const payOrder = (id: string) => request<PaymentStartResponse>(orderUrl(id, "pay"), { method: "POST" });

// Admin: move an order through the fulfilment flow.
export const updateOrderStatus = async ({ id, status }: { id: string; status: string }): Promise<Order | null> => {
  const res = await request<OrderDetailResponse>(API.admin.order(id), {
    method: "PATCH",
    body: { status },
  });
  if ("id" in res) return res;
  return res.order ?? res.data ?? null;
};

export const cancelOrder = (id: string) => request<OrderResponse>(orderUrl(id, "cancel"), { method: "POST" });
