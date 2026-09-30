"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Check, Loader2, Package, PartyPopper, Star } from "lucide-react";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { useCreateReview } from "@/features/reviews/hooks/useReviews";
import { ReviewModalData } from "@/features/reviews/types/review.types";
import { markReviewed, readReviewed } from "@/features/reviews/reviewed";

const REVIEW_MIN = 10;
const REVIEW_MAX = 1000;
const ratingLabels = ["", "Terrible", "Poor", "Okay", "Good", "Excellent"];

type FormValues = { rating: number; review: string };

export function ReviewForm() {
  const { modalData, closeModal } = useModalStore();
  const data = modalData as ReviewModalData | null;
  const products = data?.products ?? [];

  const [reviewed, setReviewed] = useState<string[]>(() => readReviewed());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hover, setHover] = useState(0);
  const createReview = useCreateReview();

  const pending = products.filter((p) => !reviewed.includes(p.productId));
  const active = products.find((p) => p.productId === activeId && !reviewed.includes(p.productId)) ?? pending[0] ?? null;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { rating: 0, review: "" } });
  const rating = useWatch({ control, name: "rating" });
  const reviewText = useWatch({ control, name: "review" }) ?? "";

  const selectProduct = (productId: string) => {
    setActiveId(productId);
    reset({ rating: 0, review: "" });
    setHover(0);
  };

  const onSubmit = handleSubmit(({ rating, review }) => {
    if (!active) return;
    createReview.mutate(
      { product_id: active.productId, rating: String(rating), review: review.trim() },
      {
        onSuccess: () => {
          markReviewed(active.productId);
          setReviewed((prev) => [...prev, active.productId]);
          setActiveId(null);
          reset({ rating: 0, review: "" });
          setHover(0);
        },
      }
    );
  });

  if (!data) return null;

  // Everything reviewed: thank-you state.
  if (!active) {
    return (
      <div className="flex flex-col items-center px-2 py-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-lg shadow-primary/30">
          <PartyPopper className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-text-primary">Thanks for your feedback!</h2>
        <p className="mt-1 text-sm text-text-muted">Your reviews help other shoppers choose with confidence.</p>
        <button
          type="button"
          onClick={closeModal}
          className="mt-6 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03]"
        >
          Done
        </button>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <div className="p-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Order {data.orderLabel} delivered</p>
      <h2 className="mt-1 pr-8 text-xl font-bold text-text-primary">How was your order?</h2>
      <p className="text-sm text-text-muted">Rate your products and tell others what you think.</p>

      {/* Product picker, shown when the order has more than one product */}
      {products.length > 1 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Products to review">
          {products.map((p) => {
            const done = reviewed.includes(p.productId);
            const selected = active.productId === p.productId;
            return (
              <button
                key={p.productId}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={done || createReview.isPending}
                onClick={() => selectProduct(p.productId)}
                title={p.name}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  selected ? "border-primary ring-4 ring-primary/10" : done ? "border-success/50 opacity-60" : "border-border hover:border-primary/40"
                }`}
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- API-hosted image
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-soft-background text-text-muted">
                    <Package className="h-5 w-5" />
                  </span>
                )}
                {done && (
                  <span className="absolute inset-0 flex items-center justify-center bg-success/70 text-white">
                    <Check className="h-5 w-5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-5 space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-soft-background p-3">
          {active.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- API-hosted image
            <img src={active.image} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-card-background object-cover" />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card-background text-text-muted">
              <Package className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">{active.name}</p>
            {products.length > 1 && (
              <p className="text-xs text-text-muted">
                {products.length - pending.length} of {products.length} reviewed
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-text-secondary">Your rating</p>
          <div className="flex items-center gap-3">
            <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setValue("rating", n, { shouldValidate: true })}
                  className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Star className={`h-8 w-8 transition-colors ${n <= shown ? "fill-warning text-warning" : "fill-border text-border"}`} />
                </button>
              ))}
            </div>
            <span className={`text-sm font-semibold ${shown ? "text-text-primary" : "text-text-muted"}`}>
              {shown ? ratingLabels[shown] : "Tap to rate"}
            </span>
          </div>
          <input type="hidden" {...register("rating", { validate: (v) => (v >= 1 && v <= 5) || "Please choose a rating" })} />
          {errors.rating && <p className="mt-1 text-xs text-error">{errors.rating.message}</p>}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-text-secondary">Your review</span>
          <textarea
            rows={4}
            maxLength={REVIEW_MAX}
            placeholder="What did you like or dislike? How was the quality?"
            className={`w-full resize-none rounded-xl border bg-card-background px-4 py-2.5 text-sm transition-colors placeholder:text-text-muted focus:outline-none focus:ring-4 ${
              errors.review ? "border-error focus:border-error focus:ring-error/10" : "border-border focus:border-primary focus:ring-primary/10"
            }`}
            {...register("review", {
              validate: (v) => v.trim().length >= REVIEW_MIN || `Write at least ${REVIEW_MIN} characters`,
            })}
          />
          <span className="mt-1 flex justify-between text-[11px]">
            <span className="text-error">{errors.review?.message}</span>
            <span className="text-text-muted">
              {reviewText.length}/{REVIEW_MAX}
            </span>
          </span>
        </label>

        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={closeModal} className="text-sm font-semibold text-text-secondary hover:text-primary">
            Maybe later
          </button>
          <button
            type="submit"
            disabled={createReview.isPending}
            className="flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {createReview.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending.length > 1 ? "Submit & next" : "Submit review"}
          </button>
        </div>
      </form>
    </div>
  );
}
