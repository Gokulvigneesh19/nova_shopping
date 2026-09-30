import { Review } from "@/features/products/types/product.types";
import { Rating } from "./Rating";

export function ReviewCard({ review }: { review: Review }) {
  const initial = review.user_email?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card-background p-4 transition-shadow duration-300 hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gradient-start to-gradient-end text-sm font-semibold text-white">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="truncate text-sm font-semibold text-text-primary">
            {review.user_email}
          </p>
          {review.created_at && (
            <span className="shrink-0 text-xs text-text-muted">
              {new Date(review.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        <div className="mt-1">
          <Rating value={review.rating} />
        </div>
        {review.review && (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {review.review}
          </p>
        )}
      </div>
    </div>
  );
}
