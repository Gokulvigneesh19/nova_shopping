"use client";

import { useRef, useState } from "react";
import { LayoutGrid, SearchX, X } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { Pagination } from "@/features/products/components/Pagination";
import { sortOptions } from "@/features/products/components/FilterModal";
import { useFilteredProducts } from "@/features/products/hooks/useFilteredProducts";
import { CatalogCategory, useShopCatalog } from "@/features/products/hooks/useShopCatalog";
import useShopFilterStore from "@/lib/globalstore/shopFilter.store";
import { formatMoney } from "@/lib/utils/currency";
import { useCategories } from "@/features/categories/hooks/useCategories";

const PAGE_SIZE = 12;

const chip =
  "flex items-center gap-1 rounded-full bg-hover-bg px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white animate-scale-in";

function CategoryTile({
  category,
  active,
  onSelect,
  index,
}: {
  category?: Pick<CatalogCategory, "name" | "image"> | null;
  active: boolean;
  onSelect: (name: string | null) => void;
  index: number;
}) {
  console.log("category", category);
  return (
    <button
      type="button"
      onClick={() => onSelect(category?.name ?? null)}
      aria-pressed={active}
      title={category?.name ?? "All Products"}
      style={{ animationDelay: `${index * 40}ms` }}
      className="group flex w-16 shrink-0 snap-start animate-fade-in-up flex-col items-center gap-1.5 opacity-0 [animation-fill-mode:forwards] sm:w-18"
    >
      <span
        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 ease-brand group-hover:-translate-y-0.5 sm:h-14 sm:w-14 ${active
          ? "border-transparent ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "border-border group-hover:border-primary/40 group-hover:shadow-md group-hover:shadow-primary/10"
          } ${category?.image ? "bg-soft-background" : "bg-linear-to-br from-gradient-start to-gradient-end text-white"}`}
      >
        {category?.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- API-hosted image, no remotePatterns configured
          <img src={ category.image} alt="" className="h-full w-full object-cover" />
        ) : category ? (
          <span className="text-base font-bold">{category.name?.toUpperCase()}</span>
        ) : (
          <LayoutGrid className="h-5 w-5" />
        )}
      </span>
      <span
        className={`w-full truncate text-center text-[11px] font-semibold transition-colors ${active ? "text-primary" : "text-text-secondary group-hover:text-primary"}`}
      >
        {category?.name}
      </span>
    </button>
  );
}

export function HomeView() {
  const { search, category, setCategory, maxPrice, setMaxPrice, sort, setSort, setSearch, clearFilters } =
    useShopFilterStore();
  const { filtered, isFetching, debouncedSearch, debouncedMaxPrice } = useFilteredProducts();
  const { data: categories, isLoading } = useCategories();
  console.log("categories", categories);

  // The API ignores `page` and doesn't return a total, so paging happens client-side.
  // Any filter/sort/search change resets to page 1.
  const filterKey = JSON.stringify([category, debouncedMaxPrice, debouncedSearch, sort]);
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = pageState.key === filterKey ? Math.min(pageState.page, totalPages) : 1;
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const resultsRef = useRef<HTMLElement>(null);

  const goToPage = (p: number) => {
    setPageState({ key: filterKey, page: p });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectCategory = (name: string | null) => {
    setCategory(name);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sortLabel = sort && sortOptions.find((o) => o.value === sort)?.label;
  const hasFilters = category !== null || maxPrice !== null || !!sort || debouncedSearch !== "";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Categories */}
      <section aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="text-base font-bold text-text-primary sm:text-lg">
          Shop by Category
        </h2>
        <div className="-mx-4 mt-2 flex snap-x gap-2 overflow-x-auto px-4 py-2 scrollbar-none sm:mx-0 sm:gap-3 sm:px-0">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-18"
              >
                <span className="h-12 w-12 animate-pulse rounded-full bg-hover-bg sm:h-14 sm:w-14" />
                <span className="h-2.5 w-10 animate-pulse rounded bg-hover-bg" />
              </span>
            ))
          ) : (
            <>
              {/* All Category - Always First */}
              <CategoryTile
                key="all"
                index={0}
                active={category === null}
                onSelect={selectCategory}
              />

              {/* Other Categories */}
              {categories?.map((cat, i) => (
                <CategoryTile
                  key={cat?.name ?? `category-${i}`}
                  category={cat}
                  index={i + 1}
                  active={category === cat?.name}
                  onSelect={selectCategory}
                />
              ))}
            </>
          )}
        </div>
      </section>

      {/* Products */}
      <section ref={resultsRef} aria-labelledby="products-heading" className="mt-6 scroll-mt-24 sm:mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="products-heading" className="text-xl font-bold text-text-primary sm:text-2xl">
            {category ?? "All Products"}
          </h2>
          {isLoading ? (
            <div className="h-4 w-32 animate-pulse rounded bg-hover-bg" />
          ) : (
            <p className="text-sm text-text-secondary">
              {totalPages > 1 && (
                <>
                  Showing{" "}
                  <span className="font-semibold text-text-primary">
                    {pageStart + 1}&ndash;{pageStart + pageItems.length}
                  </span>{" "}
                  of{" "}
                </>
              )}
              <span className="font-semibold text-text-primary">{filtered.length}</span> product
              {filtered.length !== 1 && "s"}
            </p>
          )}
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {debouncedSearch && (
              <button type="button" onClick={() => setSearch("")} className={chip}>
                <span className="max-w-40 truncate">&ldquo;{debouncedSearch}&rdquo;</span>
                <X className="h-3 w-3" />
              </button>
            )}
            {category && (
              <button type="button" onClick={() => setCategory(null)} className={chip}>
                {category}
                <X className="h-3 w-3" />
              </button>
            )}
            {maxPrice !== null && (
              <button type="button" onClick={() => setMaxPrice(null)} className={chip}>
                Up to {formatMoney(maxPrice, { decimals: 0 })}
                <X className="h-3 w-3" />
              </button>
            )}
            {sortLabel && (
              <button type="button" onClick={() => setSort(undefined)} className={chip}>
                {sortLabel}
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mt-5">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-soft-background px-6 py-16 text-center sm:py-24 animate-fade-in">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover-bg text-primary">
                <SearchX className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-text-primary">
                No products match your filters
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Try a different search, widening the price or picking another category
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-linear-to-br from-gradient-start to-gradient-end px-5 py-2 text-xs font-semibold text-white shadow-md shadow-primary/30 transition-transform hover:-translate-y-0.5"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 gap-3 transition-opacity sm:gap-5 md:grid-cols-3 lg:gap-6 xl:grid-cols-4 ${isFetching ? "opacity-60" : ""
                }`}
            >
              {pageItems.map((product, i) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${(i % 8) * 60}ms` }}
                  className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          )}
        </div>
      </section>
    </div>
  );
}
