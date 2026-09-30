"use client";

import { Mail } from "lucide-react";
import { formatCurrency, formatDate } from "@/features/admin/data/mock";
import { useCustomers } from "@/features/customers/hooks/useCustomers";

export function CustomersView() {
  const { data, isLoading, isError } = useCustomers();

  const totalCustomers = data?.users_count ?? 0;
  const totalSpent = data?.total_spent ?? 0;
  const summary = [
    { label: "Customers", value: totalCustomers.toLocaleString("en-US") },
    { label: "Lifetime revenue", value: formatCurrency(totalSpent) },
    { label: "Avg. spend", value: formatCurrency(data?.average_spent ?? 0) },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card-background p-5">
            <p className="text-sm text-text-secondary">{s.label}</p>
            {isLoading ? (
              <div className="mt-2 h-7 w-24 animate-pulse rounded bg-soft-background" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-text-primary">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card-background">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-soft-background text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Joined</th>
                <th className="px-3 py-3 text-right font-semibold">Orders</th>
                <th className="px-3 py-3 text-right font-semibold">Total spent</th>
                {/* <th className="px-6 py-3" /> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="h-9 w-9 animate-pulse rounded-full bg-soft-background" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 animate-pulse rounded bg-soft-background" />
                          <div className="h-3 w-40 animate-pulse rounded bg-soft-background" />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5" colSpan={4}>
                      <div className="h-3.5 w-full animate-pulse rounded bg-soft-background" />
                    </td>
                  </tr>
                ))}
              {!isLoading && (isError || (data?.users ?? []).length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-text-muted">
                    {isError ? "Failed to load customers." : "No customers found."}
                  </td>
                </tr>
              )}
              {!isLoading && (data?.users ?? []).map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-soft-background">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hover-bg text-sm font-semibold text-primary">
                        {c.first_name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-text-primary">{`${c.first_name} ${c.last_name}`.trim() || c.email}</p>
                        <p className="text-xs text-text-muted">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-text-secondary">{formatDate(c.created_at)}</td>
                  <td className="px-3 py-3.5 text-right text-text-secondary">{c.orders}</td>
                  <td className="px-3 py-3.5 text-right font-semibold text-text-primary">{formatCurrency(c.total_spent)}</td>
                  {/* <td className="px-6 py-3.5 text-right">
                    <a
                      href={`mailto:${c.email}`}
                      aria-label={`Email ${`${c.first_name} ${c.last_name}`.trim() || c.email}`}
                      className="inline-flex rounded-lg p-2 text-text-muted hover:bg-hover-bg hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
