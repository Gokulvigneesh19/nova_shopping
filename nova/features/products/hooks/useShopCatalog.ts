import { useMemo } from "react";
import { useProducts } from "./useProducts";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Product } from "../types/product.types";

export type CatalogCategory = { name: string; count: number; image?: string | null };

// The unfiltered catalog drives the filters (categories + price ceiling) so they stay stable
// while search/sort/price change the listing.
export function useShopCatalog() {
  const { data, isLoading } = useProducts();
  const { data: categoryData } = useCategories();
  const allProducts = useMemo(() => (data?.products ?? []) as Product[], [data]);

  const categories = useMemo<CatalogCategory[]>(() => {
    const counts = new Map<string, number>();
    allProducts.forEach((p) =>
      counts.set(p.category_name, (counts.get(p.category_name) ?? 0) + 1)
    );
    const images = new Map((categoryData ?? []).map((c) => [c.name, c.image]));
    return Array.from(counts, ([name, count]) => ({ name, count, image: images.get(name) }));
  }, [allProducts, categoryData]);

  // Backend filters on `price`, so the ceiling is based on it too
  const priceCeiling = useMemo(
    () =>
      Math.max(100, Math.ceil(Math.max(0, ...allProducts.map((p) => Number(p.price) || 0)) / 10) * 10),
    [allProducts]
  );

  return { allProducts, categories, priceCeiling, isLoading };
}
