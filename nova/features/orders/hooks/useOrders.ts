import { keepPreviousData } from "@tanstack/react-query";
import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { CART_QUERY_KEY } from "@/features/cart/hooks/useCart";
import { useToastStore } from "@/lib/globalstore/toast.store";
import {
  cancelOrder,
  checkoutOrder,
  getAdminOrders,
  getOrder,
  getOrders,
  payOrder,
  updateOrderStatus,
} from "../services/order.service";
import { stepLabel } from "../status";
import { Order } from "../types/order.types";

export const ORDERS_QUERY_KEY = ["orders"];

export function useOrders(enabled: boolean = true) {
  return useCustomQuery<Order[]>(ORDERS_QUERY_KEY, (signal) => getOrders(signal), {
    enabled,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

// Nested under ORDERS_QUERY_KEY so every order mutation refreshes the admin list too.
export function useAdminOrders() {
  return useCustomQuery<Order[]>([...ORDERS_QUERY_KEY, "admin"], (signal) => getAdminOrders(signal), {
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useCustomQuery<Order>([...ORDERS_QUERY_KEY, id], (signal) => getOrder(id, signal), {
    enabled: !!id,
    staleTime: 0,
  });
}

// Order-creating/payment calls must never auto-retry, or a flaky network could create duplicates.
export function useCheckoutOrder() {
  return useCustomMutation(checkoutOrder, {
    mutationKey: ["checkoutOrder"],
    retry: 0,
    invalidateQueries: [ORDERS_QUERY_KEY, CART_QUERY_KEY, ["cartCount"]],
  });
}

export function usePayOrder() {
  return useCustomMutation(payOrder, {
    mutationKey: ["payOrder"],
    retry: 0,
  });
}

export function useCancelOrder() {
  return useCustomMutation(cancelOrder, {
    mutationKey: ["cancelOrder"],
    retry: 0,
    invalidateQueries: [ORDERS_QUERY_KEY],
    successMessage: "Order cancelled",
  });
}

// Admin status updates; refetches every order query so lists and detail pages stay in sync.
export function useUpdateOrderStatus() {
  const toast = useToastStore();
  return useCustomMutation(updateOrderStatus, {
    mutationKey: ["updateOrderStatus"],
    retry: 0,
    invalidateQueries: [ORDERS_QUERY_KEY],
    onSuccess: (_data, { status }) => toast.triggerToast(`Order marked as ${stepLabel(status)}`, "success", "top-right"),
  });
}
