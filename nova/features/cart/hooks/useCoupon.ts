import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { applyCoupon, removeCoupon } from "../services/cart.service";
import { CART_QUERY_KEY } from "./useCart";

// Both refetch the cart so subtotal, discount and total come from the API.
export function useApplyCoupon() {
  return useCustomMutation(applyCoupon, {
    mutationKey: ["applyCoupon"],
    retry: 0,
    invalidateQueries: [CART_QUERY_KEY],
  });
}

export function useRemoveCoupon() {
  return useCustomMutation(removeCoupon, {
    mutationKey: ["removeCoupon"],
    retry: 0,
    invalidateQueries: [CART_QUERY_KEY],
    successMessage: "Coupon removed",
  });
}
