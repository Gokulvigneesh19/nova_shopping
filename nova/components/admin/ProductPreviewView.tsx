"use client";

import Link from "next/link";
import { ArrowLeft, EyeOff, Eye, Loader2, Pencil } from "lucide-react";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { useProductsbyID } from "@/features/products/hooks/useProducts";

// Renders the storefront product page inside the admin panel, read-only.
export function ProductPreviewView({ id }: { id: string }) {
  const { data, isLoading, isError } = useProductsbyID(id);
  const product = data?.product;

  if (isLoading || isError || !product) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <>
            <p className="text-error">Couldn’t load this product.</p>
            <Link href="/admin/products" className="text-sm text-primary hover:underline">
              Back to products
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-hover-bg px-4 py-3">
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Products
        </Link>
        <span className="h-4 w-px bg-border" />
        <p className="flex items-center gap-2 text-sm text-text-primary">
          <Eye className="h-4 w-4 text-primary" />
          <span>
            <span className="font-semibold">Preview mode</span>
            <span className="hidden text-text-secondary sm:inline">: this is how customers see this product. Buying is disabled.</span>
          </span>
        </p>
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="ml-auto flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-4 py-2 text-xs font-semibold text-white shadow-md shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Pencil className="h-3.5 w-3.5" /> Edit product
        </Link>
      </div>

      {!product.is_active && (
        <p className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <EyeOff className="h-4 w-4 shrink-0" />
          This product is inactive, so customers can’t see it in the store yet.
        </p>
      )}

      {/* Storefront frame */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="flex items-center gap-2 border-b border-border bg-soft-background px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </span>
          <span className="mx-auto truncate rounded-full bg-card-background px-4 py-1 text-xs text-text-muted">/shop/{product.id}</span>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 text-xs text-text-muted">
            <span>Home</span>
            <span>/</span>
            <span>Shop</span>
            <span>/</span>
            <span className="text-text-primary">{product.name}</span>
          </nav>
          <ProductDetail product={product} preview />
        </div>
      </div>
    </div>
  );
}
