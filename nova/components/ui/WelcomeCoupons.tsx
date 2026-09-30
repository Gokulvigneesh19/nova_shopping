"use client";

import { useState } from "react";
import { Check, Copy, Gift, TicketPercent, UserPlus } from "lucide-react";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { useToastStore } from "@/lib/globalstore/toast.store";
import { formatMoney } from "@/lib/utils/currency";
import { discountLabel } from "@/features/coupons/utils";
import type { WelcomeCouponModalData } from "@/features/coupons/hooks/useWelcomeCoupon";

const formatDay = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// Welcome modal for first-order shoppers: lists "new customers only" coupons with copyable codes.
export function WelcomeCoupons() {
  const { modalData, closeModal } = useModalStore();
  const { triggerToast } = useToastStore();
  const data = modalData as WelcomeCouponModalData | null;
  const coupons = data?.coupons ?? [];
  const title = data?.title ?? "Welcome to NovaShop!";
  const subtitle = data?.subtitle ?? "It's your first order, so here's a little something to make it special.";
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      triggerToast(`${code} copied. Paste it in the coupon box.`, "success", "top-right");
      window.setTimeout(() => setCopied((c) => (c === code ? null : c)), 2000);
    } catch {
      triggerToast("Couldn't copy. Select the code and copy it manually.", "error", "top-right");
    }
  };

  if (!data) return null;

  return (
    <div className="-m-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-gradient-start to-gradient-end px-6 pb-8 pt-7 text-white">
        <span className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" aria-hidden />
        <span className="absolute -bottom-16 left-6 h-32 w-32 rounded-full bg-white/5" aria-hidden />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Gift className="h-6 w-6" />
        </span>
        <h2 className="relative mt-4 text-2xl font-bold">{title}</h2>
        <p className="relative mt-1 text-sm text-white/80">{subtitle}</p>
      </div>

      {coupons.length === 0 && (
        <div className="-mt-4 mx-5 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card-background px-4 py-8 text-center">
          <TicketPercent className="h-8 w-8 text-text-muted" />
          <p className="mt-2 text-sm font-semibold text-text-primary">No coupons right now</p>
          <p className="mt-0.5 text-xs text-text-muted">Check back soon for new offers.</p>
        </div>
      )}

      {/* Coupons */}
      <ul className="-mt-4 space-y-3 px-5 pb-2">
        {coupons.map((c) => {
          const minOrder = Number(c.min_order_amount);
          const isCopied = copied === c.code;
          return (
            <li
              key={c.id}
              className="relative animate-scale-in overflow-hidden rounded-2xl border border-border bg-card-background shadow-lg shadow-primary/10"
            >
              <div className="flex items-stretch">
                {/* Ticket stub */}
                <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-hover-bg px-2 text-center">
                  <span className="text-lg font-extrabold leading-tight text-primary">{discountLabel(c).replace(" off", "")}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">off</span>
                </div>
                {/* Perforation */}
                <div className="relative w-0 border-l-2 border-dashed border-border" aria-hidden>
                  <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-card-background ring-1 ring-border" />
                  <span className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-card-background ring-1 ring-border" />
                </div>

                <div className="min-w-0 flex-1 p-4">
                  <p className="text-sm leading-snug text-text-secondary">{c.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate rounded-lg border border-dashed border-primary/40 bg-soft-background px-3 py-1.5 text-center font-mono text-sm font-bold tracking-widest text-text-primary select-all">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(c.code)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isCopied ? "bg-success text-white" : "bg-primary text-white hover:bg-primary/90"
                      }`}
                      aria-label={`Copy code ${c.code}`}
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-text-muted">
                    {c.only_for_new && (
                      <span className="inline-flex items-center gap-1">
                        <UserPlus className="h-3 w-3" /> First order only ·
                      </span>
                    )}
                    <span>{minOrder > 0 ? `Min. order ${formatMoney(minOrder, { decimals: 0 })}` : "No minimum"}</span>
                    {c.end_date && <span>· Valid till {formatDay(c.end_date)}</span>}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-center gap-1 px-6 pb-6 pt-3 text-center">
        {coupons.length > 0 && <p className="text-xs text-text-muted">Paste the code in the coupon box in your order summary.</p>}
        <button
          type="button"
          onClick={closeModal}
          className="mt-2 w-full rounded-full bg-linear-to-r from-gradient-start to-gradient-end py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95"
        >
          {coupons.length > 0 ? "Start saving" : "Close"}
        </button>
      </div>
    </div>
  );
}
