import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import { Product } from "@/features/products/types/product.types";

export type ProductSort =
  | "best_sellers"
  | "discounted"
  | "price_low_to_high"
  | "price_high_to_low";

export interface productQueryParams {
  search?: string;
  page?: number;
  sort?: ProductSort;
  min_price?: number;
  max_price?: number;
  limit?: number;
}
export interface ProductResponse {
  message: string;
  products: Record<string, any>[];
  no_of_products: number;
}
export interface ProductDetailResponse {
  message: string;
  product: Product;
}

export const getProducts = (params?: productQueryParams, signal?: AbortSignal) => {
  return request<ProductResponse>(API.users.products, {
    method: "GET",
    body: params,
    signal,
  });
};

export const getProductsbyID = (id:string,params?: productQueryParams, signal?: AbortSignal) => {
  return request<ProductDetailResponse>(API.users.products + `${id}`, {
    method: "GET",
    body: params,
    signal,
  });
};

export interface CreateProductPayload {
  category_id: string;
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  stock: number;
  is_active: boolean;
  is_discounted: boolean;
  is_bestseller: boolean;
  // Leave null to keep the existing cover on update.
  cover_image: File | null;
  sub_images: File[];
}

const toProductFormData = ({ cover_image, sub_images, ...fields }: CreateProductPayload) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, String(value)));
  if (cover_image) formData.append("cover_image", cover_image);
  sub_images.forEach((file) => formData.append("sub_images", file));
  return formData;
};

export const createProduct = (payload: CreateProductPayload) => {
  return request<ProductDetailResponse, FormData>(API.users.products, {
    method: "POST",
    body: toProductFormData(payload),
  });
};

// On update, leave `cover_image` null / `sub_images` empty to keep the existing ones.
export const updateProduct = ({ id, payload }: { id: string; payload: CreateProductPayload }) => {
  return request<ProductDetailResponse, FormData>(`${API.users.products}${id}/`, {
    method: "PUT",
    body: toProductFormData(payload),
  });
};
