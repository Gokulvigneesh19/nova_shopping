"use client";

import { Fragment, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Download, Loader2, MapPin, MessageSquareText, Package, Search } from "lucide-react";
import { useAdminOrders, useUpdateOrderStatus } from "@/features/orders/hooks/useOrders";
import { OrderStatusStepper } from "@/features/orders/components/OrderStatusStepper";
import { FULFILMENT_STEPS, OFF_FLOW_STATUSES, nextStep, stepIndexOf, stepLabel } from "@/features/orders/status";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { Order } from "@/features/orders/types/order.types";
import {
  formatOrderDate,
  itemImage,
  itemName,
  itemTotal,
  itemUnitPrice,
  orderCharges,
  orderLabel,
  orderMoney,
  orderMoneyOrDash,
  orderTotal,
  shippingCityLine,
} from "@/features/orders/utils";

// Known statuses appear in this order; any other status the API returns gets its own tab after them.
const STATUS_ORDER = ["pending", ...FULFILMENT_STEPS.map((s) => s.value as string), "cancelled", "failed"];
const ALL = "all";

const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const paymentTone = (status: string) => {
  const s = status.toLowerCase();
  if (["paid", "captured", "success", "completed"].includes(s)) return "text-success";
  if (["failed", "refunded"].includes(s)) return "text-error";
  return "text-warning";
};

// CSV of the currently filtered orders, one row per order.
function exportCsv(rows: Order[]) {
  const header = [
    "Order", "Date", "Status", "Payment status", "Payment method", "Customer", "Phone",
    "Address", "City", "State", "Postal code", "Country", "Items", "Subtotal", "Discount",
    "Shipping", "Tax", "Platform fee", "Total", "Note",
  ];
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((o) =>
    [
      orderLabel(o), o.created_at, o.status, o.payment_status, o.payment_method, o.shipping_name, o.shipping_phone_number,
      o.shipping_address, o.shipping_city, o.shipping_state, o.shipping_postal_code, o.shipping_country,
      (o.items ?? []).map((it) => `${itemName(it)} x${it.quantity}`).join("; "),
      o.subtotal, o.discount, o.shipping_fee, o.tax, o.platform_fee, o.total_amount, o.customer_note,
    ].map(cell).join(",")
  );
  const blob = new Blob([[header.map(cell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: `orders-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

// Status stepper + actions; every change is confirmed first because customers see it.
function StatusPanel({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const [target, setTarget] = useState<string | null>(null);
  const status = order.status.toLowerCase();
  const next = nextStep(status);
  const offFlow = status in OFF_FLOW_STATUSES;
  const saving = updateStatus.isPending;
  const savingStatus = saving ? (updateStatus.variables?.status ?? null) : null;
  const isBackward = target !== null && stepIndexOf(target) < stepIndexOf(status);

  const apply = (value: string) =>
    updateStatus.mutate({ id: order.id, status: value }, { onSettled: () => setTarget(null) });

  return (
    <div className="rounded-xl border border-border bg-card-background p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Order status</p>
          <p className="text-sm text-text-secondary">
            {offFlow ? "This order can't be fulfilled yet." : next ? "Click a step or use the button to update it." : "This order is complete."}
          </p>
        </div>
        {next && !offFlow && (
          <button
            type="button"
            onClick={() => apply(next.value)}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-4 py-2 text-xs font-semibold text-white shadow-md shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {saving && savingStatus === next.value ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            Mark as {next.label}
          </button>
        )}
      </div>

      <OrderStatusStepper
        status={order.status}
        updatedAt={order.updated_at}
        editable
        disabled={saving}
        savingStatus={savingStatus}
        onSelect={(value) => (next && value === next.value ? apply(value) : setTarget(value))}
      />

      {target && (
        <div
          className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm animate-fade-in ${
            isBackward ? "bg-warning/10 text-warning" : "bg-hover-bg text-primary"
          }`}
        >
          <p className="font-medium">
            {isBackward ? "Move this order back to " : "Skip ahead to "}
            <span className="font-bold">{stepLabel(target)}</span>? The customer will see this change.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTarget(null)}
              disabled={saving}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-card-background"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => apply(target)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-70"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Update status
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  const items = order.items ?? [];
  return (
    <div className="grid gap-4 bg-soft-background px-6 py-5 lg:grid-cols-[1fr_280px]">
      <div className="lg:col-span-2">
        <StatusPanel order={order} />
      </div>
      <div className="rounded-xl border border-border bg-card-background">
        <p className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted">Items</p>
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 px-4 py-3">
              {itemImage(it) ? (
                // eslint-disable-next-line @next/next/no-img-element -- API-hosted image
                <img src={itemImage(it)} alt={itemName(it)} className="h-10 w-10 shrink-0 rounded-lg bg-soft-background object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-soft-background text-text-muted">
                  <Package className="h-4 w-4" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{itemName(it)}</p>
                <p className="text-xs text-text-muted">
                  {it.quantity} × {orderMoneyOrDash(itemUnitPrice(it))}
                </p>
              </div>
              <p className="text-sm font-semibold text-text-primary">{orderMoneyOrDash(itemTotal(it))}</p>
            </li>
          ))}
          {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-text-muted">No items</li>}
        </ul>
      </div>

      <div className="space-y-3 text-sm">
        <div className="rounded-xl border border-border bg-card-background p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            <MapPin className="h-3.5 w-3.5" /> Ship to
          </p>
          <div className="mt-2 leading-relaxed text-text-secondary">
            <p className="font-medium text-text-primary">{order.shipping_name}</p>
            <p className="whitespace-pre-line">{order.shipping_address}</p>
            <p>{shippingCityLine(order)}</p>
            <p>{order.shipping_country}</p>
            {order.shipping_phone_number && <p className="mt-1 text-xs text-text-muted">{order.shipping_phone_number}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card-background p-4">
          <dl className="space-y-1.5">
            {orderCharges(order).map((row) => (
              <div key={row.label} className="flex justify-between text-text-secondary">
                <dt>{row.label}</dt>
                <dd className={row.value < 0 ? "text-success" : "text-text-primary"}>
                  {row.freeWhenZero && row.value === 0 ? "Free" : `${row.value < 0 ? "−" : ""}${orderMoney(Math.abs(row.value))}`}
                </dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 font-bold text-text-primary">
              <dt>Total</dt>
              <dd>{orderMoney(orderTotal(order))}</dd>
            </div>
          </dl>
        </div>

        {order.customer_note && (
          <div className="rounded-xl border border-border bg-card-background p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <MessageSquareText className="h-3.5 w-3.5" /> Customer note
            </p>
            <p className="mt-2 whitespace-pre-line text-text-secondary">{order.customer_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrdersView() {
  const { data: orders = [], isLoading, isFetching, isError, refetch } = useAdminOrders();
  const [tab, setTab] = useState(ALL);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const tabs = useMemo(() => {
    const present = new Set(orders.map((o) => o.status.toLowerCase()));
    const extra = [...present].filter((s) => !STATUS_ORDER.includes(s)).sort();
    return [ALL, ...STATUS_ORDER.filter((s) => present.has(s)), ...extra];
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (tab === ALL || o.status.toLowerCase() === tab) &&
        (!q ||
          [o.order_number, o.shipping_name, o.shipping_phone_number, o.shipping_city, ...(o.items ?? []).map(itemName)].some((f) =>
            f?.toLowerCase().includes(q)
          ))
    );
  }, [orders, tab, query]);

  const countFor = (t: string) => (t === ALL ? orders.length : orders.filter((o) => o.status.toLowerCase() === t).length);

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card-background p-1 scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:bg-hover-bg hover:text-primary"
              }`}
            >
              {t === ALL ? "All" : titleCase(t)} <span className={tab === t ? "text-white/70" : "text-text-muted"}>{countFor(t)}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order no., customer, phone, product"
            className="w-full rounded-xl border border-border bg-card-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => exportCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-border bg-card-background px-4 py-2 text-sm font-medium text-text-secondary hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <div className={`overflow-hidden rounded-2xl border border-border bg-card-background transition-opacity ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-220 text-sm">
            <thead>
              <tr className="border-b border-border bg-soft-background text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-6 py-3 font-semibold">Order</th>
                <th className="px-3 py-3 font-semibold">Customer</th>
                <th className="px-3 py-3 font-semibold">Items</th>
                <th className="px-3 py-3 font-semibold">Date</th>
                <th className="px-3 py-3 font-semibold">Payment</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 text-right font-semibold">Amount</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }, (_, k) => (
                      <td key={k} className={k === 0 ? "px-6 py-4" : "px-3 py-4"}>
                        <div className="h-4 w-full max-w-24 animate-pulse rounded bg-soft-background" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                filtered.map((o) => {
                  const items = o.items ?? [];
                  const open = expanded === o.id;
                  const first = items[0];
                  const count = items.reduce((n, it) => n + it.quantity, 0);
                  return (
                    <Fragment key={o.id}>
                      <tr
                        onClick={() => setExpanded(open ? null : o.id)}
                        aria-expanded={open}
                        className={`cursor-pointer transition-colors hover:bg-soft-background ${open ? "bg-soft-background" : ""}`}
                      >
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-text-primary">{orderLabel(o)}</p>
                          <p className="text-xs text-text-muted">
                            {count} {count === 1 ? "item" : "items"}
                          </p>
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="font-medium text-text-primary">{o.shipping_name || "—"}</p>
                          <p className="text-xs text-text-muted">{o.shipping_phone_number}</p>
                        </td>
                        <td className="max-w-56 px-3 py-3.5 text-text-secondary">
                          <p className="truncate">{first ? itemName(first) : "—"}</p>
                          {items.length > 1 && <p className="text-xs text-text-muted">+{items.length - 1} more</p>}
                        </td>
                        <td className="px-3 py-3.5 text-text-secondary">{formatOrderDate(o.created_at)}</td>
                        <td className="px-3 py-3.5">
                          <p className={`text-xs font-semibold capitalize ${paymentTone(o.payment_status ?? "")}`}>
                            {titleCase(o.payment_status || "unknown")}
                          </p>
                          {o.payment_method && <p className="text-xs capitalize text-text-muted">{titleCase(o.payment_method)}</p>}
                        </td>
                        <td className="px-3 py-3.5">
                          <OrderStatusBadge status={o.status} />
                        </td>
                        <td className="px-3 py-3.5 text-right font-semibold text-text-primary">{orderMoney(orderTotal(o))}</td>
                        <td className="px-3 py-3.5 text-text-muted">
                          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180 text-primary" : ""}`} />
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <OrderDetails order={o} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

              {!isLoading && isError && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-error">Couldn&apos;t load orders.</p>
                    <button type="button" onClick={() => refetch()} className="mt-2 text-sm font-semibold text-primary hover:underline">
                      Try again
                    </button>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-muted">
                    {orders.length ? "No orders match your filters." : "No orders yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
