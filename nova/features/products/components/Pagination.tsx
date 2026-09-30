"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

function pageList(page: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "gap")[] = [1];
  const from = Math.max(2, Math.min(page - 1, total - 4));
  const to = Math.min(total - 1, Math.max(page + 1, 5));
  if (from > 2) pages.push("gap");
  for (let p = from; p <= to; p++) pages.push(p);
  if (to < total - 1) pages.push("gap");
  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const navBtn =
    "flex h-9 items-center gap-1.5 rounded-full border border-border bg-card-background px-3.5 text-xs font-semibold text-text-primary transition-all duration-300 ease-brand enabled:hover:-translate-y-0.5 enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 sm:px-4";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between gap-3 sm:justify-center"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={navBtn}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <ul className="hidden items-center gap-1.5 sm:flex">
        {pageList(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className="w-6 text-center text-xs text-text-muted">
              &hellip;
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`h-9 min-w-9 rounded-full px-2 text-xs font-semibold transition-all duration-300 ease-brand ${p === page
                    ? "bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30"
                    : "text-text-secondary hover:-translate-y-0.5 hover:bg-hover-bg hover:text-primary"
                  }`}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>

      {/* Compact indicator on phones */}
      <p className="text-xs text-text-secondary sm:hidden">
        Page <span className="font-semibold text-text-primary">{page}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalPages}</span>
      </p>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={navBtn}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}
