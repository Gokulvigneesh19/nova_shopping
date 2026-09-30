"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, MapPin, MessageSquareText, Package, Star, XCircle } from "lucide-react";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { hasUnreviewed, markPrompted, wasPrompted } from "@/features/reviews/reviewed";
import useAuthStore from "@/lib/globalstore/auth.store";
import { useCancelOrder, useOrder, usePayOrder } from "@/features/orders/hooks/useOrders";
import { useRazorpayPayment } from "@/features/orders/hooks/useRazorpayPayment";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { OrderStatusStepper } from "@/features/orders/components/OrderStatusStepper";
import {
  canCancelOrder,
  canPayOrder,
  formatOrderDate,
  orderCharges,
  shippingCityLine,
  itemImage,
  itemName,
  itemTotal,
  itemUnitPrice,
  orderMoneyOrDash,
  orderLabel,
  orderMoney,
  orderTotal,
  isDelivered,
  reviewModalDataFor,
} from "@/features/orders/utils";

export function OrderDetailView({ id, justPaid = false }: { id: string; justPaid?: boolean }) {
  const { userProfile } = useAuthStore();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const payOrderMutation = usePayOrder();
  const cancelMutation = useCancelOrder();
  const { pay, busy: paying, status: paymentStatus } = useRazorpayPayment();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [paidNow, setPaidNow] = useState(false);
  const { triggerModal } = useModalStore();

  // Once an order is delivered, ask for reviews automatically — only once per order, and only if something is unreviewed.
  useEffect(() => {
    if (!order || !isDelivered(order) || wasPrompted(order.id)) return;
    const data = reviewModalDataFor(order);
    markPrompted(order.id);
    if (data.products.length && hasUnreviewed(data.products.map((p) => p.productId))) triggerModal("review", data);
  }, [order, triggerModal]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <p className="text-error">Couldn&apos;t load this order.</p>
        <div className="flex gap-4 text-sm font-semibold">
          <button type="button" onClick={() => refetch()} className="text-primary hover:underline">Try again</button>
          <Link href="/orders" className="text-text-secondary hover:text-primary">My orders</Link>
        </div>
      </div>
    );
  }

  const items = order.items ?? [];
  const payable = canPayOrder(order);
  const cancellable = canCancelOrder(order);
  const busy = paying || payOrderMutation.isPending || cancelMutation.isPending;
  const showPaidBanner = (justPaid || paidNow) && !payable;

  // "Pay now": ask the API for a fresh Razorpay order, then repeat steps 3–4.
  const handlePayNow = () => {
    payOrderMutation.mutate(order.id, {
      onSuccess: (res) =>
        pay({
          ...res,
          order: res.order ?? order,
          prefill: {
            name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : undefined,
            email: userProfile?.email,
            contact: userProfile?.phone_number ?? undefined,
          },
          onPaid: () => setPaidNow(true),
        }),
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate(order.id, { onSettled: () => setConfirmCancel(false) });
  };

  const summary = orderCharges(order);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/orders" className="hover:text-primary">My orders</Link>
        <span>/</span>
        <span className="text-text-primary">{orderLabel(order)}</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Order {orderLabel(order)}</h1>
          <p className="text-sm text-text-muted">Placed on {formatOrderDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          {isDelivered(order) && reviewModalDataFor(order).products.length > 0 && (
            <button
              type="button"
              onClick={() => triggerModal("review", reviewModalDataFor(order))}
              className="flex items-center gap-1.5 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-4 py-2 text-xs font-semibold text-white shadow-md shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Star className="h-3.5 w-3.5 fill-current" /> Rate &amp; review
            </button>
          )}
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card-background p-5 sm:p-6" aria-label="Order progress">
        <h2 className="mb-4 font-semibold text-text-primary">Order progress</h2>
        <OrderStatusStepper status={order.status} updatedAt={order.updated_at} />
      </section>

      {showPaidBanner && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 animate-fade-in">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-semibold text-text-primary">Thank you! Your payment was successful.</p>
            <p className="text-sm text-text-secondary">We&apos;ve received your order and will start preparing it right away.</p>
          </div>
        </div>
      )}

      {payable && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-semibold text-text-primary">Payment pending</p>
              <p className="text-sm text-text-secondary">Complete the payment to confirm this order, or cancel it.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {cancellable &&
              (confirmCancel ? (
                <>
                  <span className="text-xs font-medium text-error">Cancel this order?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(false)}
                    disabled={cancelMutation.isPending}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-card-background"
                  >
                    Keep order
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="flex items-center gap-1.5 rounded-full bg-error px-4 py-2 text-xs font-semibold text-white hover:bg-error/90 disabled:opacity-70"
                  >
                    {cancelMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Yes, cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card-background px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-error hover:text-error disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel order
                </button>
              ))}
            <button
              type="button"
              onClick={handlePayNow}
              disabled={busy}
              className="flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
            >
              {(payOrderMutation.isPending || paying) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {paymentStatus === "verifying" ? "Confirming…" : `Pay now · ${orderMoney(orderTotal(order))}`}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card-background">
          <h2 className="border-b border-border px-5 py-4 font-semibold text-text-primary sm:px-6">
            Items {items.length > 0 && <span className="text-sm font-normal text-text-muted">({items.length})</span>}
          </h2>
          <ul className="divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                {itemImage(it) ? (
                  // eslint-disable-next-line @next/next/no-img-element -- API-hosted image
                  <img
                    src={itemImage(it)}
                    alt={itemName(it)}
                    className="h-16 w-16 shrink-0 rounded-xl border border-border bg-soft-background object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-soft-background text-text-muted">
                    <Package className="h-6 w-6" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-text-primary">{itemName(it)}</p>
                  <p className="text-xs text-text-muted">
                    Qty {it.quantity} × {orderMoneyOrDash(itemUnitPrice(it))}
                  </p>
                </div>
                <p className="font-semibold text-text-primary">
                  {orderMoneyOrDash(itemTotal(it))}
                </p>
              </li>
            ))}
            {items.length === 0 && <li className="px-6 py-8 text-center text-sm text-text-muted">No items on this order.</li>}
          </ul>
        </section>

        <aside className="h-fit space-y-4">
          <div className="rounded-2xl border border-border bg-card-background p-5">
            <h2 className="font-semibold text-text-primary">Payment summary</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {summary.map((row) => (
                <div key={row.label} className="flex justify-between text-text-secondary">
                  <dt>{row.label}</dt>
                  <dd className={row.value < 0 || (row.freeWhenZero && row.value === 0) ? "font-semibold text-success" : "text-text-primary"}>
                    {row.freeWhenZero && row.value === 0 ? "Free" : `${row.value < 0 ? "−" : ""}${orderMoney(Math.abs(row.value))}`}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-text-primary">
                <dt>Total</dt>
                <dd>{orderMoney(orderTotal(order))}</dd>
              </div>
              {order.payment_status && (
                <p className="pt-1 text-xs capitalize text-text-muted">Payment: {order.payment_status.replace(/_/g, " ")}</p>
              )}
            </dl>
          </div>

          {(order.shipping_name || order.shipping_address) && (
            <div className="rounded-2xl border border-border bg-card-background p-5 text-sm">
              <h2 className="flex items-center gap-1.5 font-semibold text-text-primary">
                <MapPin className="h-4 w-4 text-primary" /> Delivery address
              </h2>
              <div className="mt-2 leading-relaxed text-text-secondary">
                {order.shipping_name && <p className="font-medium text-text-primary">{order.shipping_name}</p>}
                {order.shipping_address && <p className="whitespace-pre-line">{order.shipping_address}</p>}
                <p>{shippingCityLine(order)}</p>
                {order.shipping_country && <p>{order.shipping_country}</p>}
                {order.shipping_phone_number && <p className="mt-1 text-xs text-text-muted">Phone: {order.shipping_phone_number}</p>}
              </div>
            </div>
          )}

          {order.customer_note && (
            <div className="rounded-2xl border border-border bg-card-background p-5 text-sm">
              <h2 className="flex items-center gap-1.5 font-semibold text-text-primary">
                <MessageSquareText className="h-4 w-4 text-primary" /> Your note
              </h2>
              <p className="mt-2 whitespace-pre-line text-text-secondary">{order.customer_note}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
