import { request } from "@/lib/api";
import { API } from "@/lib/api/endpoints";
import { AddToCartPayload, ApplyCouponPayload, CartResponse, Cart, CouponResponse } from "../types/cart.type";


export const AddToCart = (payload: AddToCartPayload, signal?: AbortSignal) => {
  return request<CartResponse>(API.users.cart, {
    method: "POST",
    body: payload,
  });
};

export const AddProduct = (payload: AddToCartPayload,id:string, signal?: AbortSignal) => {
  return request<CartResponse>(`${API.users.cart}${id}/`, {
    method: "PUT",
    body: payload,
  });
};

export const DeleteProduct = (id:string, signal?: AbortSignal) => {
  return request<CartResponse>(`${API.users.cart}${id}/`, {
    method: "DELETE",
  });
};

// The API may return the cart itself or wrap it in `{ cart }`; normalise to CartResponse.
export const getCart = async (signal?: AbortSignal): Promise<CartResponse> => {
  const res = await request<CartResponse | Cart>(API.users.cart, {
    method: "GET",
    signal,
  });
  return "cart" in res ? res : { message: "", cart: res };
};

export const applyCoupon = (payload: ApplyCouponPayload) =>
  request<CouponResponse, ApplyCouponPayload>(API.users.cartCoupon, { method: "POST", body: payload });

export const removeCoupon = () => request<CouponResponse>(API.users.cartCoupon, { method: "DELETE" });
