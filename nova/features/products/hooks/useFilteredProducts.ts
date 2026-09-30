import { useEffect, useMemo, useState } from "react";
import { useProducts } from "./useProducts";
import { Product } from "../types/product.types";
import { productQueryParams } from "../services/product.service";
import useShopFilterStore from "@/lib/globalstore/shopFilter.store";

// Shared by the listing and the filter modal so both resolve to the same cached query.
export function useFilteredProducts() {
  const { search, category, maxPrice, sort } = useShopFilterStore();
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim());
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);

  // Avoid firing a request on every keystroke / slider tick
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMaxPrice(maxPrice), 400);
    return () => clearTimeout(t);
  }, [maxPrice]);

  const params = useMemo<productQueryParams | undefined>(() => {
    if (!sort && debouncedMaxPrice == null && !debouncedSearch) return undefined;
    return {
      search: debouncedSearch || undefined,
      sort,
      max_price: debouncedMaxPrice ?? undefined,
    };
  }, [sort, debouncedMaxPrice, debouncedSearch]);
  const { data, isFetching } = useProducts(params);
  const products = useMemo(() => (data?.products ?? []) as Product[], [data]);

  // Category filter isn't supported by the API yet, so it stays client-side
  const filtered = useMemo(
    () => (category ? products.filter((p) => p.category_name === category) : products),
    [products, category]
  );

  const isPending = isFetching || debouncedSearch !== search.trim() || debouncedMaxPrice !== maxPrice;

  return { filtered, isFetching, isPending, debouncedSearch, debouncedMaxPrice };
}
