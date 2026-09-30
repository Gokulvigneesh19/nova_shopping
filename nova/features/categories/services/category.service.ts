import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import { Category, CategoryPayload } from "@/features/categories/types/category.types";

type CategoryListResponse =
  | Category[]
  | { message?: string; categories?: Category[]; results?: Category[]; data?: Category[] };

type CategoryDetailResponse = Category | { message?: string; category?: Category; data?: Category };

// The API may return a bare array or wrap it; normalise to Category[].
export const getCategories = async (signal?: AbortSignal): Promise<Category[]> => {
  const res = await request<CategoryListResponse>(API.users.categories, {
    method: "GET",
    signal,
  });
  if (Array.isArray(res)) return res;
  return res.categories ?? res.results ?? res.data ?? [];
};

// The API may return the category directly or wrap it; normalise to Category.
export const getCategoriesbyID = async (id: string, signal?: AbortSignal): Promise<Category> => {
  const res = await request<CategoryDetailResponse>(`${API.users.categories}${id}/`, {
    method: "GET",
    signal,
  });
  if ("id" in res) return res;
  const category = res.category ?? res.data;
  if (!category) throw new Error("Category not found");
  return category;
};

const toCategoryFormData = ({ image, ...fields }: CategoryPayload) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.append(key, String(value)));
  // Omit `image` to keep the existing one on update.
  if (image) formData.append("image", image);
  return formData;
};

export const createCategory = (payload: CategoryPayload) => {
  return request<Category, FormData>(API.users.categories, {
    method: "POST",
    body: toCategoryFormData(payload),
  });
};

export const updateCategory = ({ id, payload }: { id: string; payload: CategoryPayload }) => {
  return request<Category, FormData>(`${API.users.categories}${id}/`, {
    method: "PUT",
    body: toCategoryFormData(payload),
  });
};

export const deleteCategory = (id: string) => {
  return request<unknown>(`${API.users.categories}${id}/`, {
    method: "DELETE",
  });
};
