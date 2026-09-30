"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MessageSquareText, Search, Star, ThumbsDown, X } from "lucide-react";
import { formatDate } from "@/features/admin/data/mock";
import { Rating } from "@/features/products/components/Rating";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import { AdminReview } from "@/features/reviews/types/review.types";

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Highest rating", value: "highest" },
  { label: "Lowest rating", value: "lowest" },
];

const time = (r: AdminReview) => new Date(r.created_at).getTime() || 0;

const sorters: Record<SortKey, (a: AdminReview, b: AdminReview) => number> = {
  newest: (a, b) => time(b) - time(a),
  oldest: (a, b) => time(a) - time(b),
  highest: (a, b) => b.rating - a.rating || time(b) - time(a),
  lowest: (a, b) => a.rating - b.rating || time(b) - time(a),
};

const productIdOf = (r: AdminReview) => r.product_id ?? r.product;

function ReviewSkeleton() {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card-background p-4">
      <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-soft-background" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 animate-pulse rounded bg-soft-background" />
        <div className="h-3 w-24 animate-pulse rounded bg-soft-background" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-soft-background" />
      </div>
    </div>
  );
}

export function ReviewsView() {
  const { data: reviews = [], isLoading, isFetching, isError } = useReviews();
  const [query, setQuery] = useState("");
  const [stars, setStars] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");

  const stats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star
    let sum = 0;
    reviews.forEach((r) => {
      const n = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[n - 1]++;
      sum += r.rating;
    });
    const total = reviews.length;
    return {
      total,
      average: total ? sum / total : 0,
      counts,
      low: counts[0] + counts[1],
      positive: total ? Math.round(((counts[3] + counts[4]) / total) * 100) : 0,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews
      .filter((r) => stars == null || Math.round(r.rating) === stars)
      .filter(
        (r) =>
          !q ||
          [r.user, r.user_email, r.review, r.product_name].some((f) => f?.toLowerCase().includes(q)),
      )
      .sort(sorters[sort]);
  }, [reviews, query, stars, sort]);

  const summary = [
    { label: "Total reviews", value: stats.total.toLocaleString("en-US"), icon: MessageSquareText },
    { label: "Average rating", value: stats.average.toFixed(1), icon: Star, extra: <Rating value={stats.average} /> },
    { label: "Positive (4★+)", value: `${stats.positive}%`, icon: Star },
    { label: "Low ratings (1–2★)", value: stats.low.toLocaleString("en-US"), icon: ThumbsDown },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, icon: Icon, extra }) => (
          <div key={label} className="rounded-2xl border border-border bg-card-background p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">{label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hover-bg text-primary">
                <Icon className="h-4.5 w-4.5" />
              </span>
            </div>
            {isLoading ? (
              <div className="mt-3 h-7 w-20 animate-pulse rounded bg-soft-background" />
            ) : (
              <>
                <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
                {extra && <div className="mt-1">{extra}</div>}
              </>
            )}
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Rating distribution; click a row to filter */}
        <aside className="h-fit rounded-2xl border border-border bg-card-background p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold text-text-primary">Rating breakdown</h2>
          <p className="text-xs text-text-muted">Click a row to filter</p>
          <ul className="mt-4 space-y-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = stats.counts[n - 1];
              const pct = stats.total ? (count / stats.total) * 100 : 0;
              const active = stars === n;
              return (
                <li key={n}>
                  <button
                    type="button"
                    onClick={() => setStars(active ? null : n)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                      active ? "bg-hover-bg text-primary" : "text-text-secondary hover:bg-soft-background"
                    }`}
                  >
                    <span className="flex w-7 items-center gap-0.5 font-semibold">
                      {n} <Star className="h-3 w-3 fill-current" />
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-soft-background">
                      <span
                        className="block h-full rounded-full bg-linear-to-r from-gradient-start to-gradient-end transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="w-8 text-right tabular-nums">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by customer, product or text"
                className="w-full rounded-xl border border-border bg-card-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort reviews"
              className="rounded-xl border border-border bg-card-background px-3 py-2 text-sm text-text-secondary focus:border-primary focus:outline-none"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {stars != null && (
              <button
                type="button"
                onClick={() => setStars(null)}
                className="flex items-center gap-1 rounded-full bg-hover-bg px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-white"
              >
                {stars}★ only <X className="h-3 w-3" />
              </button>
            )}
            {!isLoading && <span className="ml-auto text-xs text-text-muted">{filtered.length} reviews</span>}
          </div>

          <ul className={`space-y-3 transition-opacity ${isFetching && !isLoading ? "opacity-60" : ""}`}>
            {isLoading
              ? Array.from({ length: 5 }, (_, i) => (
                  <li key={i}>
                    <ReviewSkeleton />
                  </li>
                ))
              : filtered.map((r) => {
                  const name = r.user || r.user_email;
                  const productId = productIdOf(r);
                  return (
                    <li key={r.id} className="flex gap-3 rounded-2xl border border-border bg-card-background p-4 transition-shadow hover:shadow-md">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gradient-start to-gradient-end text-sm font-semibold text-white">
                        {name?.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-primary">{name}</p>
                            {r.user && r.user_email && r.user !== r.user_email && (
                              <p className="truncate text-xs text-text-muted">{r.user_email}</p>
                            )}
                          </div>
                          {r.created_at && <span className="shrink-0 text-xs text-text-muted">{formatDate(r.created_at)}</span>}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Rating value={r.rating} />
                          {r.rating <= 2 && (
                            <span className="rounded-full bg-error/10 px-2 py-0.5 text-[11px] font-semibold text-error">Needs attention</span>
                          )}
                        </div>
                        {r.review && <p className="mt-2 text-sm leading-relaxed text-text-secondary">{r.review}</p>}
                        {(r.product_name || productId) && (
                          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs">
                            {r.product_image && (
                              // eslint-disable-next-line @next/next/no-img-element -- API-hosted image, no remotePatterns configured
                              <img src={r.product_image} alt="" className="h-7 w-7 rounded-md bg-soft-background object-cover" />
                            )}
                            <span className="text-text-muted">on</span>
                            {productId ? (
                              <Link href={`/admin/products/${productId}/preview`} className="truncate font-semibold text-primary hover:underline">
                                {r.product_name ?? "View product"}
                              </Link>
                            ) : (
                              <span className="truncate font-semibold text-text-primary">{r.product_name}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
          </ul>

          {isError && <p className="py-12 text-center text-error">Couldn’t load reviews. Please try again.</p>}
          {!isLoading && !isError && filtered.length === 0 && (
            <p className="py-12 text-center text-text-muted">
              {reviews.length ? "No reviews match your filters." : "No reviews yet."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
