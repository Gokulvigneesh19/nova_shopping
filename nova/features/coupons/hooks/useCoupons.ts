import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { createCoupon, deleteCoupon, getCoupons, updateCoupon } from "../services/coupon.service";
import { Coupon } from "../types/coupon.types";

export const COUPONS_QUERY_KEY = ["coupons"];

export function useCoupons(enabled: boolean = true) {
  return useCustomQuery<Coupon[]>(COUPONS_QUERY_KEY, (signal) => getCoupons(signal), { staleTime: 0, enabled });
}

export function useCreateCoupon() {
  return useCustomMutation(createCoupon, {
    mutationKey: ["createCoupon"],
    retry: 0,
    invalidateQueries: [COUPONS_QUERY_KEY],
    successMessage: "Coupon created",
  });
}

export function useUpdateCoupon() {
  return useCustomMutation(updateCoupon, {
    mutationKey: ["updateCoupon"],
    retry: 0,
    invalidateQueries: [COUPONS_QUERY_KEY],
    successMessage: "Coupon updated",
  });
}

export function useDeleteCoupon() {
  return useCustomMutation(deleteCoupon, {
    mutationKey: ["deleteCoupon"],
    retry: 0,
    invalidateQueries: [COUPONS_QUERY_KEY],
    successMessage: "Coupon deleted",
  });
}
