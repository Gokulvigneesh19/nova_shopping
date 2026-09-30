"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, IndianRupee, Percent, ShoppingBag, UserPlus } from "lucide-react";
import { formatCurrency, formatDate } from "@/features/admin/data/mock";
import { useDashboard } from "@/features/admin/hooks/useDashboard";
import { DashboardStat, DashboardStats } from "@/features/admin/types/dashboard.types";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { RevenueChart } from "./RevenueChart";
import { CategorySales } from "./CategorySales";
import { ProductInsights } from "./ProductInsights";

const statCards: { key: keyof DashboardStats; label: string; icon: typeof IndianRupee; format: (v: number) => string }[] = [
  { key: "total_revenue", label: "Total Revenue", icon: IndianRupee, format: formatCurrency },
  { key: "orders", label: "Orders", icon: ShoppingBag, format: (v) => v.toLocaleString("en-IN") },
  { key: "new_customers", label: "New Customers", icon: UserPlus, format: (v) => v.toLocaleString("en-IN") },
  { key: "conversion_rate", label: "Conversion Rate", icon: Percent, format: (v) => `${v}%` },
];

const shortDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

function StatChange({ stat }: { stat: DashboardStat }) {
  const change = stat.change_percentage;
  if (change === null) return <span className="font-semibold text-success">New</span>;
  const up = change >= 0;
  return (
    <span className={`inline-flex items-center font-semibold ${up ? "text-success" : "text-error"}`}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(change)}%
    </span>
  );
}

export function DashboardView() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card-background p-8 text-center">
        <p className="font-semibold text-text-primary">Couldn&apos;t load the dashboard</p>
        <p className="mt-1 text-sm text-text-secondary">{error.message}</p>
        <button onClick={() => refetch()} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  const period = data?.period;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">Welcome back 👋</p>
          <h2 className="text-2xl font-bold text-text-primary">Here&apos;s how NovaShop is doing</h2>
        </div>
        {period && (
          <span className="rounded-full border border-border bg-card-background px-3 py-1.5 text-xs font-medium text-text-secondary">
            {shortDate(period.start_date)} – {shortDate(period.end_date)}, {period.end_date.slice(0, 4)}
          </span>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, format }) => {
          const stat = data?.stats[key];
          return (
            <div key={key} className="rounded-2xl border border-border bg-card-background p-5 transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-secondary">{label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hover-bg text-primary">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              {stat ? (
                <>
                  <p className="mt-3 text-2xl font-bold text-text-primary">{format(Number(stat.value))}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                    <StatChange stat={stat} />
                    vs last month
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-3 h-8 w-2/3 animate-pulse rounded bg-hover-bg" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-hover-bg" />
                </>
              )}
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={data?.revenue_chart} />
        </div>
        <CategorySales data={data?.sales_by_category} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-card-background xl:col-span-2">
          <div className="flex items-center justify-between p-5 sm:px-6">
            <h2 className="font-semibold text-text-primary">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-border bg-soft-background text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-5 py-3 font-semibold sm:px-6">Order</th>
                  <th className="px-3 py-3 font-semibold">Customer</th>
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold sm:px-6">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading &&
                  Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-3 sm:px-6">
                        <div className="h-8 animate-pulse rounded bg-hover-bg" />
                      </td>
                    </tr>
                  ))}
                {data?.recent_orders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-soft-background">
                    <td className="px-5 py-3 font-semibold text-text-primary sm:px-6">{o.order_number}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-text-primary">{o.customer_name}</p>
                      <p className="text-xs text-text-muted">
                        {o.product_name}
                        {o.other_items_count > 0 && ` +${o.other_items_count} more`}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{formatDate(o.created_at)}</td>
                    <td className="px-3 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold text-text-primary sm:px-6">{formatCurrency(Number(o.total_amount))}</td>
                  </tr>
                ))}
                {data && data.recent_orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-text-muted sm:px-6">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ProductInsights topProducts={data?.top_products} lowStock={data?.low_stock} />
      </section>
    </div>
  );
}
