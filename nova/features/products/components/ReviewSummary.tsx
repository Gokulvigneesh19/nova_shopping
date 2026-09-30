import { Star } from "lucide-react";
import { Product } from "@/features/products/types/product.types";
import { Rating } from "./Rating";

export function ReviewSummary({ product, fn }: { product: Product, fn: () => void }) {
  const total = product.reviews.length;
  const average = total > 0 ? product.total_ratings : 0;
  const full = Math.round(average);

  const counts = [5, 4, 3, 2, 1].map((star) => {
    const count = product.reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return { star, pct };
  });

  return (
    <div className="border border-border p-4 rounded-2xl">
      <div className="flex  items-center  gap-6  sm:flex-row  sm:justify-between">
        <div className="flex flex-col items-center justify-center gap-1 sm:w-48 sm:shrink-0">
          <span className="text-4xl font-extrabold text-text-primary">
            {average.toFixed(1)}
          </span>
          <Rating value={average} reviews={total} />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          {counts.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-6 shrink-0">{star} ★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-linear-to-r from-gradient-start to-gradient-end"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-text-muted">{pct}%</span>
            </div>
          ))}
        </div>


      </div>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={fn}
          className="shrink-0 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform duration-300 ease-brand hover:scale-105 active:scale-95"
        >
          View all reviews
        </button>
      </div>
    </div>
  );
}
