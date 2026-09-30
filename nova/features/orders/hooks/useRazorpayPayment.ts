"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { useToastStore } from "@/lib/globalstore/toast.store";
import { loadRazorpay } from "@/lib/razorpay";
import { CART_QUERY_KEY } from "@/features/cart/hooks/useCart";
import { reportPaymentFailed, verifyPayment } from "../services/order.service";
import { Order, PaymentStartResponse } from "../types/order.types";
import { ORDERS_QUERY_KEY } from "./useOrders";
import { CURRENCY } from "@/lib/utils/currency";

export type PaymentStatus = "idle" | "opening" | "open" | "verifying";

type PayOptions = PaymentStartResponse & {
  prefill?: { name?: string; email?: string; contact?: string };
  /** Payment verified by the backend. */
  onPaid?: (order: Order) => void;
  /** Checkout closed without a verified payment (dismissed, failed, or couldn't open). */
  onUnpaid?: (order: Order) => void;
};

const BRAND_COLOR = "#6c3bff";

// Steps 3–4: open Razorpay Checkout, then verify the payment or report the failure.
export function useRazorpayPayment() {
  const queryClient = useQueryClient();
  const { triggerToast } = useToastStore();
  const [status, setStatus] = useState<PaymentStatus>("idle");

  const verify = useCustomMutation(verifyPayment, {
    mutationKey: ["verifyPayment"],
    retry: 0,
    successMessage: "Payment successful",
    errorMessage: "We couldn't confirm your payment. If money was deducted it will be refunded or reflected shortly.",
  });
  const reportFailure = useCustomMutation(reportPaymentFailed, {
    mutationKey: ["paymentFailed"],
    retry: 0,
    errorMessage: "Payment failed",
  });

  const refreshAfterPayment = () =>
    Promise.all(
      [ORDERS_QUERY_KEY, CART_QUERY_KEY, ["cartCount"]].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
    );

  const pay = async ({ order, razorpay, prefill, onPaid, onUnpaid }: PayOptions) => {
    setStatus("opening");
    const key =  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpayOrderId = razorpay.order_id ?? razorpay.razorpay_order_id ?? razorpay.id;

    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay || !key || !razorpayOrderId) {
      setStatus("idle");
      triggerToast(
        !loaded ? "Couldn't load the payment window. Check your connection and try again." : "Payment details are missing. Please try again.",
        "error",
        "top-right"
      );
      onUnpaid?.(order);
      return;
    }

    let paid = false;
    const checkout = new window.Razorpay({
      key,
      amount: razorpay.amount,
      currency: razorpay.currency ?? order.currency ?? CURRENCY.code,
      order_id: razorpayOrderId,
      name: razorpay.name ?? "NovaShop",
      description: razorpay.description ?? `Order ${order.order_number ?? order.id}`,
      prefill: { ...prefill, ...razorpay.prefill },
      notes: { order_id: order.id },
      theme: { color: BRAND_COLOR },
      handler: (response) => {
        paid = true;
        setStatus("verifying");
        verify.mutate(response, {
          onSuccess: (data) => {
            refreshAfterPayment();
            onPaid?.(data?.order ?? order);
          },
          onError: () => onUnpaid?.(order),
          onSettled: () => setStatus("idle"),
        });
      },
      modal: {
        // Ask before closing so a half-finished payment isn't abandoned by accident.
        confirm_close: true,
        ondismiss: () => {
          if (paid) return;
          setStatus("idle");
          refreshAfterPayment();
          onUnpaid?.(order);
        },
      },
    });

    // Razorpay keeps its window open after a failure so the user can retry; we just record it.
    checkout.on("payment.failed", ({ error }) => {
      reportFailure.mutate({
        razorpay_order_id: error.metadata?.order_id ?? razorpayOrderId,
        razorpay_payment_id: error.metadata?.payment_id ?? "",
        reason: error.description ?? error.reason ?? "Payment failed",
      });
      triggerToast(error.description ?? "Payment failed. You can try again.", "error", "top-right");
    });

    checkout.open();
    setStatus("open");
  };

  return { pay, status, busy: status !== "idle" };
}
