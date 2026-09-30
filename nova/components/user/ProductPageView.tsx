"use client";

import Link from "next/link";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { ProductDetailSkeleton } from "@/features/products/components/ProductDetailSkeleton";

import { useProductsbyID } from "@/features/products/hooks/useProducts";
import useShopFilterStore from "@/lib/globalstore/shopFilter.store";

export function ProductPageView({
  id,
}: {
  id: string;
}) {
  const { data, isLoading } = useProductsbyID(id);
  const product = data?.product;
  const setCategory = useShopFilterStore((s) => s.setCategory);
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        {product?.category_name && (
          <>
            <Link
              href="/"
              onClick={() => setCategory(product.category_name)}
              className="hover:text-primary"
            >
              {product.category_name}
            </Link>
            <span>/</span>
          </>
        )}
        {product ? (
          <span className="text-text-primary">{product.name}</span>
        ) : (
          <span className="h-3 w-24 animate-pulse rounded bg-hover-bg" />
        )}
      </nav>

      {isLoading || !product ? (
        <ProductDetailSkeleton />
      ) : (
        <ProductDetail product={product} />
      )}

      {/* {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-text-primary">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p, i) => (
              <div
                key={p.id}
                style={{ animationDelay: `${i * 100}ms` }}
                className="animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )} */}
    </div>
  );
}
