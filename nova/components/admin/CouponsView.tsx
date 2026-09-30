"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Copy, Loader2, Pencil, Plus, Search, TicketPercent, Trash2, UserPlus } from "lucide-react";
import { ReuseableModal } from "@/components/ui/reuseableModal";
import { CouponForm } from "@/components/admin/CouponForm";
import { useCoupons, useDeleteCoupon, useUpdateCoupon } from "@/features/coupons/hooks/useCoupons";
import { Coupon, CouponState } from "@/features/coupons/types/coupon.types";
import { couponState, couponStateStyles, discountLabel, formatCouponDate } from "@/features/coupons/utils";
import { useToastStore } from "@/lib/globalstore/toast.store";
import { formatCurrency } from "@/features/admin/data/mock";

const tabs: ("all" | CouponState)[] = ["all", "live", "scheduled", "expired", "inactive"];

function StateBadge({ state }: { state: CouponState }) {
  const { label, className } = couponStateStyles[state];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}

export function CouponsView() {
  const { data: coupons = [], isLoading, isFetching, isError, refetch } = useCoupons();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const { triggerToast } = useToastStore();

  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const [query, setQuery] = useState("");
  // `undefined` = closed, `null` = creating, a coupon = editing it.
  const [editing, setEditing] = useState<Coupon | null | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const withState = useMemo(() => coupons.map((c) => ({ coupon: c, state: couponState(c) })), [coupons]);
  const counts = useMemo(() => {
    const out: Record<string, number> = { all: withState.length };
    withState.forEach(({ state }) => (out[state] = (out[state] ?? 0) + 1));
    return out;
  }, [withState]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withState.filter(
      ({ coupon, state }) =>
        (tab === "all" || state === tab) &&
        (!q || coupon.code.toLowerCase().includes(q) || (coupon.description ?? "").toLowerCase().includes(q))
    );
  }, [withState, tab, query]);

  const togglingId = updateCoupon.isPending && updateCoupon.variables?.payload.active !== undefined ? updateCoupon.variables.id : null;
  const deletingId = deleteCoupon.isPending ? deleteCoupon.variables : null;

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      triggerToast(`Copied ${code}`, "success", "top-right");
    } catch {
      triggerToast("Couldn't copy the code", "error", "top-right");
    }
  };

  const summary = [
    { label: "Total coupons", value: counts.all ?? 0 },
    { label: "Live now", value: counts.live ?? 0, tone: "text-success" },
    { label: "Scheduled", value: counts.scheduled ?? 0, tone: "text-primary-blue" },
    { label: "Expired", value: counts.expired ?? 0, tone: "text-error" },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card-background p-5">
            <p className="text-sm text-text-secondary">{s.label}</p>
            {isLoading ? (
              <div className="mt-2 h-7 w-12 animate-pulse rounded bg-soft-background" />
            ) : (
              <p className={`mt-1 text-2xl font-bold ${s.tone ?? "text-text-primary"}`}>{s.value}</p>
            )}
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card-background p-1 scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:bg-hover-bg hover:text-primary"
              }`}
            >
              {t} <span className={tab === t ? "text-white/70" : "text-text-muted"}>{counts[t] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search codes"
            className="w-full rounded-xl border border-border bg-card-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="ml-auto flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Plus className="h-4 w-4" /> New coupon
        </button>
      </div>

      <div className={`overflow-hidden rounded-2xl border border-border bg-card-background transition-opacity ${isFetching && !isLoading ? "opacity-70" : ""}`}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-220 text-sm">
            <thead>
              <tr className="border-b border-border bg-soft-background text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-6 py-3 font-semibold">Code</th>
                <th className="px-3 py-3 font-semibold">Discount</th>
                <th className="px-3 py-3 font-semibold">Min. order</th>
                <th className="px-3 py-3 font-semibold">Validity</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Active</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading &&
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }, (_, k) => (
                      <td key={k} className={k === 0 ? "px-6 py-4" : "px-3 py-4"}>
                        <div className="h-4 w-full max-w-24 animate-pulse rounded bg-soft-background" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading &&
                filtered.map(({ coupon: c, state }) => {
                  const toggling = togglingId === c.id;
                  const deleting = deletingId === c.id;
                  const minOrder = Number(c.min_order_amount);
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-soft-background">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hover-bg text-primary">
                            <TicketPercent className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => copyCode(c.code)}
                              title="Copy code"
                              className="group flex items-center gap-1.5 font-mono text-sm font-bold tracking-wide text-text-primary hover:text-primary"
                            >
                              {c.code}
                              <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                            {c.description && <p className="max-w-56 truncate text-xs text-text-muted">{c.description}</p>}
                            {c.only_for_new && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                <UserPlus className="h-3 w-3" /> New customers
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                          {discountLabel(c)}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-text-secondary">{minOrder > 0 ? formatCurrency(minOrder) : "No minimum"}</td>
                      <td className="px-3 py-3.5 text-xs text-text-secondary">
                        <p className="flex items-center gap-1">
                          <CalendarClock className="h-3.5 w-3.5 text-text-muted" /> {formatCouponDate(c.start_date)}
                        </p>
                        <p className="pl-4.5 text-text-muted">{c.end_date ? `→ ${formatCouponDate(c.end_date)}` : "→ Never expires"}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <StateBadge state={state} />
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.active}
                          aria-label={`${c.active ? "Deactivate" : "Activate"} ${c.code}`}
                          disabled={toggling}
                          onClick={() => updateCoupon.mutate({ id: c.id, payload: { active: !c.active } })}
                          className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-60 ${c.active ? "bg-primary" : "bg-border"}`}
                        >
                          <span
                            className={`absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
                              c.active ? "translate-x-5" : ""
                            }`}
                          >
                            {toggling && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-3.5">
                        {confirmDelete === c.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-medium text-error">Delete?</span>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(null)}
                              disabled={deleting}
                              className="rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-hover-bg"
                            >
                              No
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCoupon.mutate(c.id, { onSettled: () => setConfirmDelete(null) })}
                              disabled={deleting}
                              className="flex items-center gap-1 rounded-full bg-error px-3 py-1.5 text-xs font-semibold text-white hover:bg-error/90 disabled:opacity-70"
                            >
                              {deleting && <Loader2 className="h-3 w-3 animate-spin" />} Yes, delete
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditing(c)}
                              aria-label={`Edit ${c.code}`}
                              className="rounded-full p-2 text-text-secondary hover:bg-hover-bg hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(c.id)}
                              aria-label={`Delete ${c.code}`}
                              className="rounded-full p-2 text-text-secondary hover:bg-error/10 hover:text-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {!isLoading && isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-error">Couldn&apos;t load coupons.</p>
                    <button type="button" onClick={() => refetch()} className="mt-2 text-sm font-semibold text-primary hover:underline">
                      Try again
                    </button>
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <TicketPercent className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-text-muted">{coupons.length ? "No coupons match your filters." : "No coupons yet."}</p>
                    {!coupons.length && (
                      <button type="button" onClick={() => setEditing(null)} className="mt-2 text-sm font-semibold text-primary hover:underline">
                        Create your first coupon
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReuseableModal isOpen={editing !== undefined} onClose={() => setEditing(undefined)} size="xl">
        {/* Keyed so the form resets whenever a different coupon (or "new") is opened. */}
        {editing !== undefined && <CouponForm key={editing?.id ?? "new"} coupon={editing} onDone={() => setEditing(undefined)} />}
      </ReuseableModal>
    </div>
  );
}
