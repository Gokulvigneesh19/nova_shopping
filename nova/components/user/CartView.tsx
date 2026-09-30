"use client";

import { useDeleteProduct, useIncrementProduct } from "@/features/cart/hooks/useAddToCart";
import { useCart } from "@/features/cart/hooks/useCart";
import { CouponBox } from "@/features/cart/components/CouponBox";
import { useWelcomeCouponPrompt } from "@/features/coupons/hooks/useWelcomeCoupon";
import { CartItem } from "@/features/cart/types/cart.type";
import { ArrowLeft, ArrowRight, Lock, Minus, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "@/features/cart/hooks/useCart";
import useCartViewStore from "@/lib/globalstore/cartView.store";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/globalstore/auth.store";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { formatMoney } from "@/lib/utils/currency";

const unitPrice = (item: CartItem) => Number(item.price_after_discount);
const hasDiscount = (item: CartItem) => Number(item.discount_percentage) > 0;
const money = (n: number) => formatMoney(n);

export function CartView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useCart();
  const {isAuthenticated} = useAuthStore()
  const { triggerModal } = useModalStore();
  const { setQuantity, setCartView, cartView,reset } = useCartViewStore();
  const ProductCount = useIncrementProduct();
  const DeleteProduct = useDeleteProduct();

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const items = (cartView ?? []).filter(
    (item) => !removedIds.has(item.id)
  );

  // All amounts come from the cart API; nothing is recalculated here.
  const cart = data?.cart;
  const subtotal = Number(cart?.subtotal ?? 0);
  const discount = Number(cart?.discount ?? 0);
  const couponDiscount = cart?.coupon?.is_applied ? Number(cart?.coupon_discount ?? 0) : 0;
  const total = Number(cart?.cart_amount ?? 0);
  const totalSavings = discount + couponDiscount;

  // First-order shoppers get a welcome coupon, unless one is already on the cart.
  useWelcomeCouponPrompt(!isLoading && !cart?.coupon);
  const totalItems = cart?.total_items ?? items.reduce((n, item) => n + item.quantity, 0);
  const discountPercent = subtotal > 0 ? Math.round((totalSavings / subtotal) * 100) : 0;

  const handleProductCounts = (item: CartItem, quantity: number) => {
    ProductCount.mutate({
      payload: { product: item.product, quantity: quantity },
      id: item.id,
    });
  };

  const handleDelete = (item: CartItem) => {
    if (deletingIds.has(item.id)) return;

    setDeletingIds((prev) => new Set(prev).add(item.id));
    DeleteProduct.mutate({
      id: item.id,
    },{
      onSuccess: () => {
       setTimeout(() => {
         setRemovedIds((prev) => new Set(prev).add(item.id));
         setDeletingIds((prev) => {
           const next = new Set(prev);
           next.delete(item.id);
           return next;
         });
         // Refetch after the exit animation so the API's totals reflect the removal.
         queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
       }, 550);
      }
    }
  );
  };

  useEffect(() => {
    if (data) {
      setCartView(data?.cart.items ?? []);
    }
  }, [data])
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <span className="text-text-primary">Your Bag</span>
      </nav>
      <h1 className="mt-4 animate-fade-in-down text-2xl font-bold text-text-primary">
        Your Bag ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h1>

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card-background">
            <table className="w-full text-sm">
              <thead className="hidden bg-soft-background text-xs uppercase tracking-wide text-text-muted sm:table-header-group">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">Price</th>
                  <th className="px-5 py-3 text-left font-semibold">Quantity</th>
                  <th className="px-5 py-3 text-left font-semibold">Subtotal</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-hover-bg" />
                        <div className="h-4 w-32 animate-pulse rounded bg-hover-bg" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-12 animate-pulse rounded bg-hover-bg" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-8 w-24 animate-pulse rounded-full bg-hover-bg" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-14 animate-pulse rounded bg-hover-bg" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-4 w-4 animate-pulse rounded bg-hover-bg" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card-background p-6">
            <div className="h-5 w-32 animate-pulse rounded bg-hover-bg" />
            <div className="mt-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-16 animate-pulse rounded bg-hover-bg" />
                <div className="h-4 w-12 animate-pulse rounded bg-hover-bg" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-14 animate-pulse rounded bg-hover-bg" />
                <div className="h-4 w-10 animate-pulse rounded bg-hover-bg" />
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <div className="h-4 w-10 animate-pulse rounded bg-hover-bg" />
                <div className="h-4 w-14 animate-pulse rounded bg-hover-bg" />
              </div>
            </div>
            <div className="mt-5">
              <div className="h-3 w-20 animate-pulse rounded bg-hover-bg" />
              <div className="mt-2 h-9 w-full animate-pulse rounded-full bg-hover-bg" />
            </div>
            <div className="mt-6 h-11 w-full animate-pulse rounded-full bg-hover-bg" />
            <div className="mt-3 h-4 w-28 animate-pulse rounded bg-hover-bg mx-auto" />
          </aside>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center animate-fade-in">
          <span className="text-5xl">🛍️</span>
          <p className="text-sm font-semibold text-text-primary">Your bag is empty</p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card-background">
            <table className="w-full text-sm">
              <thead className="hidden bg-soft-background text-xs uppercase tracking-wide text-text-muted sm:table-header-group">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">Price</th>
                  <th className="px-5 py-3 text-left font-semibold">Quantity</th>
                  <th className="px-5 py-3 text-left font-semibold">Subtotal</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, i) => (
                  <tr
                    key={item.id}
                    style={
                      deletingIds.has(item.id)
                        ? undefined
                        : { animationDelay: `${i * 80}ms` }
                    }
                    className={
                      deletingIds.has(item.id)
                        ? "animate-cart-row-exit"
                        : "animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                    }
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={process.env.NEXT_PUBLIC_IMAGE_URL + item.image}
                          alt={item.product_name}
                          className="h-14 w-14 shrink-0 rounded-xl bg-soft-background object-cover"
                        />
                        <div>
                          <p className="font-semibold text-text-primary">
                            {item.product_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-text-primary">{money(unitPrice(item))}</p>
                      {hasDiscount(item) && (
                        <p className="flex items-center gap-1.5 text-xs">
                          <span className="text-text-muted line-through">{money(Number(item.product_price))}</span>
                          <span className="font-semibold text-success">{Number(item.discount_percentage)}% off</span>
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex w-fit items-center rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity === 1) {
                              handleDelete(item);
                            } else {
                              handleProductCounts(item, item.quantity - 1);
                            }
                          }}
                          disabled={deletingIds.has(item.id)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center text-text-muted opacity-50 disabled:cursor-not-allowed"
                        >
                          <span
                            className={`inline-flex ${deletingIds.has(item.id) ? "animate-trash-open" : ""
                              }`}
                          >
                            {item.quantity > 1 ? <Minus width={12} height={12} color="black" /> : <Trash width={12} height={12} color="red" />}
                          </span>
                        </button>
                        <span
                          className={`inline-block w-6 text-center text-xs font-semibold ${deletingIds.has(item.id) ? "animate-cart-qty-pop" : ""
                            }`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            handleProductCounts(item, item.quantity + 1);
                          }}
                          type="button"
                          className="flex h-8 w-8 cursor-pointer items-center justify-center text-text-muted opacity-50"
                        >
                          <Plus width={12} height={12} color="black" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-text-primary">
                      {money(Number(item.total_price ?? unitPrice(item) * item.quantity))}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                      onClick={() => handleDelete(item)}
                        type="button"
                        aria-label={`Remove ${item.product_name}`}
                        className="cursor-pointer text-text-muted opacity-50"
                      >
                        <X width={12} height={12} color="black" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="h-fit animate-fade-in-up rounded-2xl border border-border bg-card-background p-6 [animation-delay:150ms]">
            <h2 className="text-lg font-bold text-text-primary">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>
                  Subtotal <span className="text-text-muted">({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                </span>
                <span className="text-text-primary">{money(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>−{money(discount)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success animate-fade-in">
                  <span>
                    Coupon <span className="font-mono text-xs font-bold">({cart?.coupon?.code})</span>
                  </span>
                  <span>−{money(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span className="text-xs text-text-muted">Calculated at checkout</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-text-primary">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            <CouponBox coupon={cart?.coupon} couponDiscount={cart?.coupon_discount} />

            {totalSavings > 0 && (
              <p className="mt-4 rounded-xl bg-success/10 px-3 py-2 text-center text-xs font-semibold text-success animate-fade-in">
                You&apos;re saving {money(totalSavings)}
                {discountPercent > 0 && ` (${discountPercent}%)`} on this order
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) router.push("/checkout");
                else triggerModal("login");
              }}
              className="group mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-[1.02] active:scale-95"
            >
              <Lock className="h-4 w-4" />
              {isAuthenticated ? "Proceed to Checkout" : "Log in to Checkout"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <Link
              href="/"
              className="group mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
