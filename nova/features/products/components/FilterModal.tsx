"use client";

import { SlidersHorizontal } from "lucide-react";
import { useModalStore } from "@/lib/globalstore/modal.store";
import useShopFilterStore from "@/lib/globalstore/shopFilter.store";
import { useShopCatalog } from "../hooks/useShopCatalog";
import { useFilteredProducts } from "../hooks/useFilteredProducts";
import { ProductSort } from "../services/product.service";
import { formatMoney } from "@/lib/utils/currency";

export const FILTER_MODAL = "filters";

export const sortOptions: { label: string; value?: ProductSort }[] = [
  { label: "Featured" },
  { label: "Best Sellers", value: "best_sellers" },
  { label: "Discounted", value: "discounted" },
  { label: "Price: Low to High", value: "price_low_to_high" },
  { label: "Price: High to Low", value: "price_high_to_low" },
];

const pillBase =
  "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ease-brand";
const pillIdle =
  "border border-border bg-card-background text-text-secondary hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary";
const pillActive =
  "bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function FilterModal() {
  const { closeModal } = useModalStore();
  const { category, setCategory, maxPrice, setMaxPrice, sort, setSort, resetFilters } =
    useShopFilterStore();
  const { categories, priceCeiling, isLoading } = useShopCatalog();
  const { filtered, isPending } = useFilteredProducts();
  const resultCount = filtered.length;

  const priceLimit = Math.min(maxPrice ?? priceCeiling, priceCeiling);
  const pricePercent = (priceLimit / priceCeiling) * 100;

  return (
    <div className="p-2">
      <div className="flex items-center gap-2.5 pr-10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hover-bg text-primary">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold text-text-primary">Filters</h2>
      </div>

      <Section title="Sort by">
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSort(opt.value)}
              className={`${pillBase} ${sort === opt.value ? pillActive : pillIdle}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Category">
        <div className="flex flex-wrap gap-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="h-8 w-24 animate-pulse rounded-full bg-hover-bg" />
            ))
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCategory(null)}
                className={`${pillBase} ${category === null ? pillActive : pillIdle}`}
              >
                All
              </button>
              {categories.map((cat) => {
                const active = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(active ? null : cat.name)}
                    className={`${pillBase} ${active ? pillActive : pillIdle}`}
                  >
                    {cat.name}
                    <span className={`ml-1.5 ${active ? "text-white/70" : "text-text-muted"}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </Section>

      <Section title="Max price">
        <div className="rounded-xl bg-soft-background p-4">
          <div className="flex justify-end">
            <span className="rounded-full bg-card-background px-3 py-1 text-sm font-bold text-primary shadow-sm">
              {formatMoney(priceLimit, { decimals: 0 })}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={10}
            value={priceLimit}
            onChange={(e) => {
              const value = Number(e.target.value);
              setMaxPrice(value >= priceCeiling ? null : value);
            }}
            aria-label="Maximum price"
            style={{
              background: `linear-gradient(to right, var(--color-primary-purple) ${pricePercent}%, var(--color-border) ${pricePercent}%)`,
            }}
            className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-(--color-primary-purple)"
          />
          <div className="mt-2 flex justify-between text-[11px] text-text-muted">
            <span>{formatMoney(0, { decimals: 0 })}</span>
            <span>{formatMoney(priceCeiling, { decimals: 0 })}</span>
          </div>
        </div>
      </Section>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-semibold text-text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Reset filters
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="rounded-full bg-linear-to-br from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition-transform hover:-translate-y-0.5 active:scale-95"
        >
          { `Show ${resultCount} ${resultCount === 1 ? "result" : "results"}`}
        </button>
      </div>
    </div>
  );
}
