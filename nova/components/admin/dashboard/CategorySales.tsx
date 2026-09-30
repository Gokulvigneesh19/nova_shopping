"use client";

import { useState } from "react";
import { formatCurrency } from "@/features/admin/data/mock";
import { DashboardResponse } from "@/features/admin/types/dashboard.types";

export function CategorySales({ data }: { data?: DashboardResponse["sales_by_category"] }) {
  const [hover, setHover] = useState<string | null>(null);
  const categories = (data?.categories ?? []).map((c) => ({
    key: c.category_id ?? "uncategorized",
    name: c.name ?? "Uncategorized",
    value: Number(c.amount),
    share: c.percentage,
  }));
  const max = Math.max(...categories.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-border bg-card-background p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-text-secondary">Sales by category</h2>
      {data ? (
        <p className="mt-1 text-2xl font-bold text-text-primary">{formatCurrency(Number(data.total))}</p>
      ) : (
        <div className="mt-2 h-8 w-32 animate-pulse rounded bg-hover-bg" />
      )}

      <ul className="mt-5 space-y-4">
        {!data &&
          Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="space-y-1.5">
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-hover-bg" />
              <div className="h-2 animate-pulse rounded-full bg-hover-bg" />
            </li>
          ))}
        {categories.map((d) => (
          <li
            key={d.key}
            onPointerEnter={() => setHover(d.key)}
            onPointerLeave={() => setHover(null)}
            className="cursor-default"
          >
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">{d.name}</span>
              <span className="text-text-secondary">
                {hover === d.key ? `${d.share}% of sales` : formatCurrency(d.value)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-soft-background">
              <div
                className={`h-2 rounded-full bg-primary transition-opacity ${hover && hover !== d.key ? "opacity-40" : ""}`}
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
        {data && categories.length === 0 && <li className="text-sm text-text-muted">No sales in this period.</li>}
      </ul>
    </div>
  );
}
