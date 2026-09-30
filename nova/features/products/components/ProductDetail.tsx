"use client";
import { getColorName } from "@/lib/utils/getColor";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/features/products/types/product.types";
import { Rating } from "./Rating";
import { ReviewCard } from "./ReviewCard";
import { ReviewSummary } from "./ReviewSummary";
import { Hero3D } from "@/components/three/Hero3D";
import { Heart, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import { formatMoney } from "@/lib/utils/currency";

// Marketing copy threshold, shown in the store currency.
const FREE_SHIPPING_OVER = 50;
const tabs = ["Overview", "Reviews", "Shipping"] as const;

// `preview` renders the storefront view for admins with purchase actions disabled.
export function ProductDetail({ product, preview = false }: { product: Product; preview?: boolean }) {
  const router = useRouter();
  // const [color, setColor] = useState(product.colors?.[0]);
  const [activeThumb, setActiveThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const AddToCartMutation = useAddToCart();

  // Cover first, then any gallery images; thumbnails only when there's more than one.
  const images = [product.cover_image ?? product.image, ...(product.sub_images ?? []).map((s) => s.image)].filter(Boolean);
  const activeImage = images[Math.min(activeThumb, images.length - 1)];

  // const handleAdd = () => {
  //   addItem(product, quantity);
  //   setAdded(true);
  //   window.setTimeout(() => setAdded(false), 1600);
  // };

  const handleBuyNow = (productId: string) => {
    AddToCartMutation.mutate({ product: productId, quantity }, {
      onSuccess: () => {
        router.push("/checkout");
      },
    });
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex animate-fade-in-up flex-col-reverse gap-4 sm:flex-row">
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-thin sm:max-h-105 sm:flex-col sm:overflow-y-auto sm:overflow-x-visible">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveThumb(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={activeThumb === i}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${activeThumb === i
                    ? "border-primary"
                    : "border-border hover:border-primary/40"
                    }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-1 items-center justify-center bg-card-background ">
            {/* <span className="animate-float text-[8rem] leading-none sm:text-[10rem]">
           <Hero3D modelUrl={product.model} position={product.position} color={color} />
          </span> */}
            <img
              key={activeImage}
              src={activeImage}
              alt={product.name}
              className="max-h-105 w-full animate-fade-in object-cover rounded-2xl"
            />
          </div>
        </div>

        {/* Info */}
        <div className="animate-fade-in-up [animation-delay:100ms]">
          <div className="flex items-center gap-2">
            {product.is_discounted && (
              <span className="rounded-full bg-hover-bg px-3 py-1 text-xs font-semibold text-primary">
                {product.is_discounted ? "Sale" : ""}
              </span>
            )}
            <span
              className={`text-xs font-medium ${product.stock <= 0
                ? "text-text-muted"
                : product.stock <= 5
                  ? "text-warning"
                  : "text-text-muted"
                }`}
            >
              {product.stock <= 0
                ? "Out of Stock"
                : product.stock <= 5
                  ? "Limited Stock — Hurry up!"
                  : "In Stock"}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-text-primary">{product?.name}</h1>
          <div className="mt-2">
            <Rating value={product.total_ratings} reviews={product.reviews.length} size="md" />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-text-primary">
              {formatMoney(product.is_discounted ? product.price_after_discount : product.price)}
            </span>
            {product.is_discounted && (
              <>
                <span className="text-lg text-text-muted line-through">
                  {formatMoney(product.price)}
                </span>
                <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-semibold text-error">
                  -{Math.round(Number(product.discount_percentage))}%
                </span>
              </>
            )}
          </div>

          {/* <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
            {product?.description}
          </p> */}

          {/* {product.colors && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-text-primary">
              Color: <span className="font-normal text-text-secondary">{getColorName(color)}</span>
            </p>
            <div className="mt-3 flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select color ${c}`}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-9 w-9 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    color === c
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border"
                  }`}
                />
              ))}
            </div>
          </div>
        )} */}

          <div className="mt-6 flex items-center gap-4">
            <p className="text-sm font-semibold text-text-primary">Quantity</p>
            <div className="flex items-center rounded-full border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={preview}
                className="flex h-9 w-9 disabled:cursor-not-allowed items-center justify-center text-text-secondary transition-colors hover:text-primary"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold text-text-primary">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={preview}
                className="flex h-9 w-9 disabled:cursor-not-allowed items-center justify-center text-text-secondary transition-colors hover:text-primary"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {product?.is_cart_added ? router.push("/cart") : AddToCartMutation.mutate({ product: product.id, quantity: 1 })}} 
              disabled={preview}
              title={preview ? "Disabled in preview" : undefined}
              className="cursor-pointer disabled:cursor-not-allowed relative overflow-hidden rounded-full bg-hover-bg px-7 py-3 text-sm font-semibold text-primary transition-all duration-300 ease-brand hover:bg-primary hover:text-white active:scale-95"
            >
              {!preview && product?.is_cart_added ? "Go to cart" : "Add to Bag"}
            </button>
            <button
              type="button"
              onClick={()=>handleBuyNow( product.id)}
              disabled={preview}
              title={preview ? "Disabled in preview" : undefined}
              className="disabled:cursor-not-allowed rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform duration-300 ease-brand hover:scale-105 active:scale-95"
            >
              Buy Now
            </button>
            {/* <button
              type="button"
              aria-label="Add to wishlist"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-secondary transition-all duration-300 hover:border-error hover:text-error"
            >
              <Heart className="h-5 w-5" />
            </button> */}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> Free shipping over {formatMoney(FREE_SHIPPING_OVER, { decimals: 0 })}
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4" /> 30-day easy returns
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Secure checkout
            </span>
          </div>

          {/* Tabs */}

        </div>
      </div>
      <div className="mt-10">
        <div className="flex gap-6 border-b border-border text-sm font-medium text-text-secondary">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative pb-3 transition-colors ${tab === t ? "text-text-primary" : "hover:text-primary"
                }`}
            >
              {t}
              {tab === t && (
                <span className="absolute -bottom-px left-0 h-0.5 w-full animate-scale-in rounded-full bg-linear-to-r from-gradient-start to-gradient-end" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 animate-fade-in  bg-card-background p-6 text-sm leading-relaxed text-text-secondary">
          {tab === "Overview" &&
            <div className="flex  gap-6">
              <div className="flex-1">
                <p className="text-text-secondary">{product.description}</p>
              </div>
              <div className="flex-1">
                <ReviewSummary product={product} fn={() => setTab("Reviews")} />
              </div>
            </div>

          }
          {tab === "Reviews" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                {product.reviews.length === 0 ? (
                  <p>No reviews yet.</p>
                ) : (
                  product.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                )}
              </div>
            </div>
          )}
          {tab === "Shipping" && (
            <p>
              Free shipping on orders over {formatMoney(FREE_SHIPPING_OVER, { decimals: 0 })}. Standard delivery takes 3-5
              business days. Easy 30-day returns.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
