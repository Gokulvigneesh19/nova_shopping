"use client";

import Link from "next/link";
import { ArrowRight, Package, ShoppingBag, Star } from "lucide-react";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { useOrders } from "@/features/orders/hooks/useOrders";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import {
  canPayOrder,
  formatOrderDate,
  isDelivered,
  itemImage,
  itemName,
  orderLabel,
  orderMoney,
  orderTotal,
  reviewModalDataFor,
} from "@/features/orders/utils";

export function OrdersView() {
  const { data: orders = [], isLoading, isError, refetch } = useOrders();
  const { triggerModal } = useModalStore();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-text-primary">My orders</span>
      </nav>
      <h1 className="mt-4 animate-fade-in-down text-2xl font-bold text-text-primary">My orders</h1>

      {isLoading ? (
        <ul className="mt-6 space-y-4" aria-label="Loading orders">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card-background p-5">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-hover-bg" />
                  <div className="h-3 w-24 animate-pulse rounded bg-hover-bg" />
                </div>
                <div className="h-6 w-24 animate-pulse rounded-full bg-hover-bg" />
              </div>
              <div className="mt-4 flex gap-2">
                {Array.from({ length: 3 }, (_, k) => (
                  <div key={k} className="h-14 w-14 animate-pulse rounded-xl bg-hover-bg" />
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : isError ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-error">Couldn&apos;t load your orders.</p>
          <button type="button" onClick={() => refetch()} className="text-sm font-semibold text-primary hover:underline">
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center animate-fade-in">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hover-bg text-primary">
            <Package className="h-7 w-7" />
          </span>
          <p className="mt-4 text-sm font-semibold text-text-primary">No orders yet</p>
          <p className="mt-1 text-xs text-text-muted">When you place an order, it&apos;ll show up here.</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03]"
          >
            <ShoppingBag className="h-4 w-4" /> Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o, i) => {
            const items = o.items ?? [];
            const count = items.reduce((n, it) => n + it.quantity, 0);
            return (
              <li
                key={o.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
              >
                <Link
                  href={`/orders/${o.id}`}
                  className="group block rounded-2xl border border-border bg-card-background p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">Order {orderLabel(o)}</p>
                      <p className="text-xs text-text-muted">
                        Placed {formatOrderDate(o.created_at)}
                        {count > 0 && ` · ${count} ${count === 1 ? "item" : "items"}`}
                      </p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex -space-x-2">
                      {items.slice(0, 4).map((it) =>
                        itemImage(it) ? (
                          // eslint-disable-next-line @next/next/no-img-element -- API-hosted image
                          <img
                            key={it.id}
                            src={itemImage(it)}
                            alt={itemName(it)}
                            className="h-12 w-12 rounded-xl border-2 border-card-background bg-soft-background object-cover"
                          />
                        ) : (
                          <span
                            key={it.id}
                            title={itemName(it)}
                            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-card-background bg-soft-background text-text-muted"
                          >
                            <Package className="h-5 w-5" />
                          </span>
                        )
                      )}
                      {items.length > 4 && (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-card-background bg-soft-background text-xs font-semibold text-text-secondary">
                          +{items.length - 4}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-xs text-text-muted">Total</p>
                        <p className="font-bold text-text-primary">{orderMoney(orderTotal(o))}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </div>

                  {isDelivered(o) && reviewModalDataFor(o).products.length > 0 && (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-hover-bg px-3 py-2">
                      <p className="text-xs font-medium text-primary">Delivered! How did you like it?</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          // Inside the card's link: open the modal instead of navigating.
                          e.preventDefault();
                          e.stopPropagation();
                          triggerModal("review", reviewModalDataFor(o));
                        }}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary/90"
                      >
                        <Star className="h-3 w-3 fill-current" /> Rate &amp; review
                      </button>
                    </div>
                  )}

                  {canPayOrder(o) && (
                    <p className="mt-4 rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
                      Payment not completed. Open the order to pay now or cancel it.
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
