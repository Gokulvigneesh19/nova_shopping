import { Star } from "lucide-react";

export function Rating({
  value,
  reviews,
  size = "sm",
}: {
  value: number;
  reviews?: number;
  size?: "sm" | "md";
}) {
  const full = Math.round(value);
  const textSize = size === "md" ? "text-sm" : "text-xs";
  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className="flex items-center gap-0.5" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={
                i < full
                  ? "h-3 w-3 fill-primary text-primary"
                  : "h-3 w-3 fill-border text-border"
              }
            />
          ))}
        </span>
      <span className="font-medium text-text-primary">{value.toFixed(1)}</span>
      {typeof reviews === "number" && (
        <span className="text-text-muted">
          ({reviews} {reviews === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
