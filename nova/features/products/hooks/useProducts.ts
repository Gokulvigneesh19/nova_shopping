import { keepPreviousData } from "@tanstack/react-query";
import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { productQueryParams, ProductResponse, ProductDetailResponse, getProducts, getProductsbyID, createProduct, updateProduct } from "../services/product.service";


export function useProducts(params?: productQueryParams) {
  return useCustomQuery<ProductResponse>(
    ["products", params],
    (signal) => getProducts(params, signal),
    {
      staleTime: Infinity,
      placeholderData: keepPreviousData,
    }
  );
}

export function useProductsbyID(id:string,params?: productQueryParams) {
  return useCustomQuery<ProductDetailResponse>(
    ["products", id, params],
    (signal) => getProductsbyID(id,params, signal),
    {
      staleTime: Infinity,
      enabled: !!id,
    }
  );
}
export function useCreateProduct() {
  return useCustomMutation(createProduct, {
    mutationKey: ["createProduct"],
    invalidateQueries: [["products"]],
    successMessage: "Product created successfully",
  });
}

export function useUpdateProduct() {
  return useCustomMutation(updateProduct, {
    mutationKey: ["updateProduct"],
    invalidateQueries: [["products"]],
    successMessage: "Product updated successfully",
  });
}
