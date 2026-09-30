"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/features/admin/data/mock";
import { DashboardLowStock, DashboardTopProduct } from "@/features/admin/types/dashboard.types";

function RowSkeleton() {
  return (
    <li className="flex items-center gap-3">
      <span className="h-10 w-10 animate-pulse rounded-lg bg-hover-bg" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-hover-bg" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-hover-bg" />
      </div>
    </li>
  );
}

export function ProductInsights({ topProducts, lowStock }: { topProducts?: DashboardTopProduct[]; lowStock?: DashboardLowStock }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card-background p-5 sm:p-6">
        <h2 className="font-semibold text-text-primary">Top products</h2>
        <ul className="mt-4 space-y-3">
          {!topProducts
            ? Array.from({ length: 5 }, (_, i) => <RowSkeleton key={i} />)
            : topProducts.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3 rounded-lg transition-colors hover:bg-soft-background">
                    <span className="w-4 text-xs font-semibold text-text-muted">{i + 1}</span>
                    {p.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- API-hosted image, no remotePatterns configured
                      <img src={p.cover_image} alt={p.name} className="h-10 w-10 rounded-lg bg-soft-background object-cover" />
                    ) : (
                      <span className="h-10 w-10 rounded-lg bg-soft-background" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-muted">
                        {p.units_sold} sold · {p.category}
                        {p.is_bestseller && <span className="ml-1.5 font-semibold text-primary">· Bestseller</span>}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">{formatCurrency(Number(p.revenue))}</p>
                  </Link>
                </li>
              ))}
          {topProducts?.length === 0 && <li className="text-sm text-text-muted">No sales in this period.</li>}
        </ul>
      </div>

      <div className="rounded-2xl bg-linear-to-br from-gradient-start to-gradient-end p-5 text-white shadow-lg shadow-primary/25 sm:p-6">
        <h2 className="font-semibold">Low stock alert</h2>
        <p className="mt-1 text-sm text-white/75">
          {!lowStock
            ? "Checking inventory…"
            : lowStock.count
              ? `${lowStock.count} product${lowStock.count === 1 ? "" : "s"} need restocking soon.`
              : "All products are well stocked."}
        </p>
        <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto text-sm">
          {lowStock?.products.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/products/${p.id}/edit`} className="flex justify-between gap-3 hover:underline">
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 font-semibold">{p.stock === 0 ? "Out" : `${p.stock} left`}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/products"
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary transition-transform hover:scale-105"
        >
          Manage inventory <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
