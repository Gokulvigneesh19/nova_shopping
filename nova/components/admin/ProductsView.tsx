"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search } from "lucide-react";
import { formatCurrency } from "@/features/admin/data/mock";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProducts } from "@/features/products/hooks/useProducts";
import { Product } from "@/features/products/types/product.types";

function StockLabel({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-xs font-semibold text-error">Out of stock</span>;
  if (stock < 10) return <span className="text-xs font-semibold text-warning">Low · {stock} left</span>;
  return <span className="text-xs text-text-secondary">{stock} in stock</span>;
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card-background">
      <div className="aspect-4/3 animate-pulse bg-hover-bg" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-hover-bg" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-hover-bg" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-hover-bg" />
      </div>
    </div>
  );
}

export function ProductsView() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("All");

  // Avoid firing a request on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  const { data: categories = [] } = useCategories();
  const { data, isLoading, isFetching, isError } = useProducts(debouncedQuery ? { search: debouncedQuery } : undefined);
  const products = useMemo(() => (data?.products ?? []) as Product[], [data]);

  const filtered = useMemo(
    () => (category === "All" ? products : products.filter((p) => p.category_id === category)),
    [products, category],
  );

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="w-full rounded-xl border border-border bg-card-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-border bg-card-background px-3 py-2 text-sm text-text-secondary focus:border-primary focus:outline-none"
        >
          <option value="All">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {!isLoading && <span className="text-xs text-text-muted">{filtered.length} products</span>}
        <Link
          href="/admin/products/new"
          className="ml-auto flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <div className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => <ProductSkeleton key={i} />)
          : filtered.map((p) => (
              <div key={p.id} className="group overflow-hidden rounded-2xl border border-border bg-card-background transition-shadow hover:shadow-xl hover:shadow-primary/10">
                <div className="relative aspect-4/3 overflow-hidden bg-soft-background">
                  <ImageCarousel images={[p.cover_image ?? p.image, ...(p.sub_images ?? []).map((s) => s.image)].filter(Boolean)} alt={p.name} />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
                      p.is_active ? "bg-white/90 text-success" : "bg-white/90 text-text-muted"
                    }`}
                  >
                    {p.is_active ? "● Active" : "○ Inactive"}
                  </span>
                  {p.is_bestseller && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">Bestseller</span>
                  )}
                  <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <Link
                      href={`/admin/products/${p.id}/preview`}
                      aria-label={`Preview ${p.name}`}
                      title="Preview as customer"
                      className="rounded-full bg-white/90 p-2 text-text-secondary shadow hover:text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      aria-label={`Edit ${p.name}`}
                      title="Edit"
                      className="rounded-full bg-white/90 p-2 text-text-secondary shadow hover:text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-primary">{p.category_name}</p>
                  <h3 className="mt-0.5 truncate font-semibold text-text-primary">{p.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-bold text-text-primary">
                        {formatCurrency(Number(p.is_discounted ? p.price_after_discount : p.price))}
                      </p>
                      {p.is_discounted && <p className="text-xs text-text-muted line-through">{formatCurrency(Number(p.price))}</p>}
                    </div>
                    <StockLabel stock={p.stock} />
                  </div>
                  {p.is_discounted && <p className="mt-1 text-xs font-medium text-success">{Number(p.discount_percentage)}% off</p>}
                </div>
              </div>
            ))}
      </div>
      {isError && <p className="py-12 text-center text-error">Couldn’t load products. Please try again.</p>}
      {!isLoading && !isError && filtered.length === 0 && <p className="py-12 text-center text-text-muted">No products match your filters.</p>}
    </div>
  );
}
