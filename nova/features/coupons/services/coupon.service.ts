import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import { Coupon, CouponPayload } from "@/features/coupons/types/coupon.types";

type CouponListResponse = Coupon[] | { message?: string; coupons?: Coupon[]; results?: Coupon[]; data?: Coupon[] };
type CouponDetailResponse = Coupon | { message?: string; coupon?: Coupon; data?: Coupon };

const toCoupon = (res: CouponDetailResponse): Coupon | null => ("id" in res ? res : (res.coupon ?? res.data ?? null));

export const getCoupons = async (signal?: AbortSignal): Promise<Coupon[]> => {
  const res = await request<CouponListResponse>(API.admin.coupons, { method: "GET", signal });
  return Array.isArray(res) ? res : (res.coupons ?? res.results ?? res.data ?? []);
};

export const createCoupon = async (payload: CouponPayload) =>
  toCoupon(await request<CouponDetailResponse, CouponPayload>(API.admin.coupons, { method: "POST", body: payload }));

// PATCH sends only the fields that changed.
export const updateCoupon = async ({ id, payload }: { id: string; payload: Partial<CouponPayload> }) =>
  toCoupon(await request<CouponDetailResponse, Partial<CouponPayload>>(API.admin.coupon(id), { method: "PATCH", body: payload }));

export const deleteCoupon = (id: string) => request<unknown>(API.admin.coupon(id), { method: "DELETE" });
