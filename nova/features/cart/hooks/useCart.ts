import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { getCart } from "../services/cart.service";
import { CartResponse } from "../types/cart.type";

export const CART_QUERY_KEY = ["cart"];

export function useCart() {
  return useCustomQuery<CartResponse>(
    CART_QUERY_KEY,
    (signal) => getCart(signal),
    {
      // Show cached items instantly, but always refetch so the bag is never stale.
      staleTime: 0,
      refetchOnMount: "always",
    }
  );
}
