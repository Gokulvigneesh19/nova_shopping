"use client";

import Link from "next/link";
import { Product } from "@/features/products/types/product.types";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import { useRouter } from "next/navigation";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { formatMoney } from "@/lib/utils/currency";
import { PackageX } from "lucide-react";

const badgeStyles: Record<string, string> = {
  "New": "bg-primary-blue text-white",
  "Best Seller": "bg-warning text-white",
  "Sale": "bg-error text-white",
};

// Links to the product page, or a plain wrapper when the card is disabled (out of stock).
function CardLink({ href, disabled, className, children }: { href: string; disabled: boolean; className?: string; children: React.ReactNode }) {
  if (disabled) return <div className={className}>{children}</div>;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const Router = useRouter();
  const AddToCartMutation = useAddToCart();
  const outOfStock = Number(product.stock) <= 0;
  // const addWhishlist = (e: React.MouseEvent<HTMLButtonElement>,productId: string) => {
  //   e.preventDefault();
  //   console.log("Added to wishlist:", productId);
  // };

  return (
    <div
      aria-disabled={outOfStock || undefined}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card-background transition-all duration-100 ease-brand ${
        outOfStock ? "cursor-not-allowed" : "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10"
      }`}
    >
      <CardLink href={`/shop/${product.id}`} disabled={outOfStock} className="block">
        <div
          className={`relative flex h-44 items-center justify-center overflow-hidden bg-linear-to-br-from-[#E0E7FF] to-[#EDE9FE] 
            sm:h-52`}
        >
          {/* ${product.gradient}  */}
          {product.is_discounted && !outOfStock && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyles["Sale"]}`}
            >
              {product.is_discounted ? "Sale" : ""}
            </span>
          )}
          <div className={`h-full w-full ${outOfStock ? "pointer-events-none opacity-60 grayscale" : ""}`}>
            <ImageCarousel
              images={[product.cover_image ?? product.image, ...(product.sub_images ?? []).map((s) => s.image)].filter(Boolean)}
              alt={product.name}
              fit="cover"
              imageClassName="transition-transform duration-500 ease-brand "
            />
          </div>
          {outOfStock && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/10">
              <span className="flex items-center gap-1.5 rounded-full bg-card-background/95 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-error shadow-md backdrop-blur">
                <PackageX className="h-3.5 w-3.5" /> Out of stock
              </span>
            </span>
          )}
          {/* <button
            type="button"
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-text-secondary  shadow-sm backdrop-blur transition-all duration-300 hover:text-error"
            onClick={(e) => addWhishlist(e, product?.id)}
          >
            <Heart className="h-4 w-4" />
          </button> */}
        </div>
      </CardLink>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <CardLink href={`/shop/${product.id}`} disabled={outOfStock}>
          <h3
            className={`line-clamp-1 text-sm font-semibold transition-colors ${
              outOfStock ? "text-text-muted" : "text-text-primary group-hover:text-primary"
            }`}
          >
            {product.name}
          </h3>
        </CardLink>
        {/* <Rating value={product.rating} reviews={product.reviews} /> */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-base font-bold ${outOfStock ? "text-text-muted" : "text-text-primary"}`}>
              {formatMoney(product.is_discounted ? product.price_after_discount : product.price)}
            </span>
            {
              product.is_discounted && (
                product.price && (
                  <span className="text-xs text-text-muted line-through">
                    {formatMoney(product.price)}
                  </span>
                )
              )
            }

          </div>
          {outOfStock ? (
            <span className="rounded-full bg-soft-background px-3 py-1.5 text-[11px] font-semibold text-text-muted" aria-label={`${product.name} is out of stock`}>
              Sold out
            </span>
          ) :
            product?.is_cart_added ?
              <button
                type="button"
                title="Go to cart"
                aria-label={`${product.name} added to bag, go to cart`}
                onClick={() => Router.push("/cart")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success transition-all duration-300 ease-brand hover:scale-110 hover:bg-success hover:text-white active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m2.05 2.05 1.099-.028a1 1 0 011.008.815l2.69 14.347A1 1 0 007.83 18H18" />
                  <path d="M4.564 5H12" />
                  <path d="M6.25 14h12.712a2 2 0 001.991-1.57l.172-1.041" />
                  <circle cx="18" cy="20" r="2" />
                  <circle cx="8" cy="20" r="2" />
                  <path d="m16 5 2 2 4-4" />
                </svg>              </button>
              :
              <button
                type="button"
                onClick={() => AddToCartMutation.mutate({ product: product.id, quantity: 1 })}
                aria-label={`Add ${product.name} to bag`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-hover-bg text-primary transition-all duration-300 ease-brand hover:scale-110 hover:bg-primary hover:text-white active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-shopping-cart-plus">
                  <path d="M16 5h6" /><path d="M19 2v6" /><path d="m2.05 2.05 1.099-.028a1 1 0 011.008.815l2.69 14.347A1 1 0 007.83 18H18" />
                  <path d="M4.564 5H12" /><path d="M6.25 14h12.712a2 2 0 001.991-1.57l.172-1.041" />
                  <circle cx="18" cy="20" r="2" />
                  <circle cx="8" cy="20" r="2" /></svg>
              </button>
          }

        </div>
      </div>
    </div>
  );
}
