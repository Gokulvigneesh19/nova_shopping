import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { createCategory, deleteCategory, getCategories, getCategoriesbyID, updateCategory } from "../services/category.service";
import { Category } from "../types/category.types";

export function useCategories() {
  return useCustomQuery<Category[]>(["categories"], (signal) => getCategories(signal));
}

export function useCategoriesbyID(id: string) {
  return useCustomQuery<Category>(["categoriesbyID", id], (signal) => getCategoriesbyID(id, signal), {
    enabled: !!id,
  });
}

export function useCreateCategory() {
  return useCustomMutation(createCategory, {
    mutationKey: ["createCategory"],
    invalidateQueries: [["categories"]],
    successMessage: "Category created successfully",
  });
}

export function useUpdateCategory() {
  return useCustomMutation(updateCategory, {
    mutationKey: ["updateCategory"],
    invalidateQueries: [["categories"], ["categoriesbyID"], ["products"]],
    successMessage: "Category updated successfully",
  });
}

export function useDeleteCategory() {
  return useCustomMutation(deleteCategory, {
    mutationKey: ["deleteCategory"],
    invalidateQueries: [["categories"], ["products"]],
    successMessage: "Category deleted successfully",
  });
}
