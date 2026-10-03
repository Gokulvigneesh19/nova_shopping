"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ImageOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCategories, useDeleteCategory } from "@/features/categories/hooks/useCategories";

function CategorySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card-background">
      <div className="aspect-video animate-pulse bg-hover-bg" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-1/2 animate-pulse rounded bg-hover-bg" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-hover-bg" />
      </div>
    </div>
  );
}

export function CategoriesView() {
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: categories = [], isLoading, isFetching, isError } = useCategories();
  const deleteMutation = useDeleteCategory();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;
  }, [categories, query]);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, { onSettled: () => setConfirmId(null) });
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories"
            className="w-full rounded-xl border border-border bg-card-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        {!isLoading && <span className="text-xs text-text-muted">{filtered.length} categories</span>}
        <Link
          href="/admin/categories/new"
          className="ml-auto flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add category
        </Link>
      </div>

      <div className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => <CategorySkeleton key={i} />)
          : filtered.map((c) => {
              const deleting = deleteMutation.isPending && deleteMutation.variables === c.id;
              return (
                <div key={c.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card-background transition-shadow hover:shadow-xl hover:shadow-primary/10">
                  <div className="relative aspect-video overflow-hidden bg-soft-background">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- API-hosted image, no remotePatterns configured
                      <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <ImageOff className="h-8 w-8" />
                      </div>
                    )}
                    {c.is_active !== undefined && (
                      <span
                        className={`absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${
                          c.is_active ? "text-success" : "text-text-muted"
                        }`}
                      >
                        {c.is_active ? "● Active" : "○ Inactive"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="truncate font-semibold text-text-primary">{c.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{c.description || "No description"}</p>

                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                      {confirmId === c.id ? (
                        <>
                          <span className="mr-auto text-xs font-medium text-error">Delete this category?</span>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={deleting}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-hover-bg disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting}
                            className="flex items-center gap-1.5 rounded-full bg-error px-3 py-1.5 text-xs font-semibold text-white hover:bg-error/90 disabled:opacity-70"
                          >
                            {deleting && <Loader2 className="h-3 w-3 animate-spin" />} Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/admin/categories/${c.id}/edit`}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-hover-bg hover:text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmId(c.id)}
                            aria-label={`Delete ${c.name}`}
                            className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-error/10 hover:text-error"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
      {isError && <p className="py-12 text-center text-error">Couldn’t load categories. Please try again.</p>}
      {!isLoading && !isError && filtered.length === 0 && (
        <p className="py-12 text-center text-text-muted">{query ? "No categories match your search." : "No categories yet."}</p>
      )}
    </div>
  );
}
