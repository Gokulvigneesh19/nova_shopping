"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Images, Loader2, Plus, X } from "lucide-react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { Field, Toggle, inputClass } from "@/components/admin/FormControls";
import { useCreateProduct, useProductsbyID, useUpdateProduct } from "@/features/products/hooks/useProducts";
import { CURRENCY_SYMBOL, formatMoney } from "@/lib/utils/currency";

type ProductFormValues = {
  category: string;
  name: string;
  description: string;
  price: string;
  is_discounted: boolean;
  discount_percentage: string;
  stock: string;
  is_active: boolean;
  is_bestseller: boolean;
};

type ImageItem = { file: File; url: string };

const steps: { title: string; description: string; fields: FieldPath<ProductFormValues>[] }[] = [
  { title: "Basics", description: "Category, name & description", fields: ["category", "name", "description"] },
  { title: "Pricing & stock", description: "Price, discount & inventory", fields: ["price", "discount_percentage", "stock"] },
  { title: "Images", description: "Cover image & gallery", fields: [] },
  { title: "Visibility", description: "Status & review", fields: [] },
];

export function ProductCreateView({ productId }: { productId?: string }) {
  const isEdit = !!productId;
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cover, setCover] = useState<ImageItem | null>(null);
  const [subImages, setSubImages] = useState<ImageItem[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const subInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const { data: productData, isLoading: productLoading, isError: productError } = useProductsbyID(productId ?? "");
  const product = productData?.product;
  const existingCover = isEdit ? (product?.cover_image ?? product?.image) : undefined;
  const existingSubs = isEdit ? (product?.sub_images ?? []) : [];
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const submitting = createMutation.isPending || updateMutation.isPending;
   console.log(categories)
  const {
    register,
    handleSubmit,
    trigger,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      category: "",
      name: "",
      description: "",
      price: "",
      is_discounted: false,
      discount_percentage: "",
      stock: "",
      is_active: true,
      is_bestseller: false,
    },
  });

  const values = useWatch({ control });
  const isDiscounted = !!values.is_discounted;

  // Prefill once the product (and category options) are available.
  useEffect(() => {
    if (!product || categoriesLoading) return;
    const discounted = product.is_discounted && Number(product.discount_percentage) > 0;
    reset({
      category: product.category_id,
      name: product.name,
      description: product.description,
      price: String(Number(product.price)),
      is_discounted: discounted,
      discount_percentage: discounted ? String(Number(product.discount_percentage)) : "",
      stock: String(product.stock),
      is_active: product.is_active,
      is_bestseller: product.is_bestseller,
    });
  }, [product, categoriesLoading, reset]);

  const hasCover = !!cover || !!existingCover;
  const COVER_ERROR = "Upload a cover image";

  // Revoke every preview URL on unmount.
  const previewsRef = useRef<ImageItem[]>([]);
  useEffect(() => {
    previewsRef.current = cover ? [cover, ...subImages] : subImages;
  }, [cover, subImages]);
  useEffect(() => () => previewsRef.current.forEach((img) => URL.revokeObjectURL(img.url)), []);

  const toItems = (files: FileList | null) =>
    Array.from(files ?? [])
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));

  const pickCover = (files: FileList | null) => {
    const [next] = toItems(files);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (!next) return;
    if (cover) URL.revokeObjectURL(cover.url);
    setCover(next);
    setImageError(null);
  };

  const removeCover = () => {
    if (cover) URL.revokeObjectURL(cover.url);
    setCover(null);
  };

  const addSubImages = (files: FileList | null) => {
    const next = toItems(files);
    if (subInputRef.current) subInputRef.current.value = "";
    if (next.length) setSubImages((prev) => [...prev, ...next]);
  };

  const removeSubImage = (index: number) => {
    setSubImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateStep = async (index: number) => {
    const ok = await trigger(steps[index].fields);
    if (index === 2 && !hasCover) {
      setImageError(COVER_ERROR);
      return false;
    }
    return ok;
  };

  const goNext = async () => {
    if (await validateStep(step)) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goTo = async (target: number) => {
    if (target <= step) return setStep(target);
    for (let i = step; i < target; i++) {
      if (!(await validateStep(i))) return setStep(i);
    }
    setStep(target);
  };

  const onSubmit = (data: ProductFormValues) => {
    if (step !== steps.length - 1) return goNext();
    if (!hasCover) {
      setStep(2);
      setImageError(COVER_ERROR);
      return;
    }
    const payload = {
        category_id: data.category,
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price).toFixed(2),
        discount_percentage: data.is_discounted ? Number(data.discount_percentage).toFixed(2) : "0.00",
        stock: Number(data.stock),
        is_active: data.is_active,
        is_discounted: data.is_discounted,
        is_bestseller: data.is_bestseller,
        cover_image: cover?.file ?? null,
        sub_images: subImages.map((img) => img.file),
    };
    const onSuccess = () => router.push("/admin/products");
    if (productId) updateMutation.mutate({ id: productId, payload }, { onSuccess });
    else createMutation.mutate(payload, { onSuccess });
  };

  const onInvalid = (errs: Partial<Record<keyof ProductFormValues, unknown>>) => {
    const target = steps.findIndex((s) => s.fields.some((f) => f in errs));
    if (target !== -1) setStep(target);
  };

  const categoryName = categories.find((c) => c.id === values.category)?.name ?? "—";
  const price = Number(values.price) || 0;
  const discount = isDiscounted ? Number(values.discount_percentage) || 0 : 0;
  const finalPrice = price * (1 - discount / 100);
  const fmt = (n: number) => formatMoney(n);

  if (isEdit && (productLoading || productError || !product)) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-24 text-center">
        {productLoading ? (
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
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>

      {/* Stepper */}
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.title}>
              <button type="button" onClick={() => goTo(i)} disabled={submitting} className="group flex w-full flex-col items-start gap-2 text-left">
                <span className={`h-1.5 w-full rounded-full transition-colors ${done || active ? "bg-linear-to-r from-gradient-start to-gradient-end" : "bg-border"}`} />
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      done ? "bg-primary text-white" : active ? "border-2 border-primary text-primary" : "border border-border text-text-muted"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={`hidden text-sm font-semibold sm:block ${active ? "text-text-primary" : "text-text-secondary"}`}>{s.title}</span>
                </span>
                <span className="hidden text-xs text-text-muted md:block">{s.description}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && step < steps.length - 1 && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            goNext();
          }
        }}
        noValidate className="rounded-2xl border border-border bg-card-background p-5 sm:p-8">
        <h2 className="text-lg font-bold text-text-primary">{steps[step].title}</h2>
        <p className="mb-6 text-sm text-text-muted">{steps[step].description}</p>

        {/* Step 1 — Basics */}
        <div className={step === 0 ? "space-y-4" : "hidden"}>
          <Field label="Category" htmlFor="category" error={errors.category?.message}>
            <select id="category" disabled={submitting || categoriesLoading} className={inputClass(!!errors.category)} {...register("category", { required: "Select a category" })}>
              <option value="">{categoriesLoading ? "Loading categories…" : "Select a category"}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categoriesError && <p className="mt-1 text-xs text-error">Couldn’t load categories. Refresh to try again.</p>}
          </Field>
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
            <input id="name" type="text" placeholder="e.g. iPhone 17 Pro" disabled={submitting} className={inputClass(!!errors.name)} {...register("name", { required: "Name is required", validate: (v) => !!v.trim() || "Name is required" })} />
          </Field>
          <Field label="Description" htmlFor="description" error={errors.description?.message}>
            <textarea id="description" rows={4} placeholder="Describe the product" disabled={submitting} className={`${inputClass(!!errors.description)} resize-y`} {...register("description", { required: "Description is required", validate: (v) => !!v.trim() || "Description is required" })} />
          </Field>
        </div>

        {/* Step 2 — Pricing & stock */}
        <div className={step === 1 ? "space-y-4" : "hidden"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`Price (${CURRENCY_SYMBOL})`} htmlFor="price" error={errors.price?.message}>
              <input
                id="price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="120000.00"
                disabled={submitting}
                className={inputClass(!!errors.price)}
                {...register("price", { required: "Price is required", validate: (v) => Number(v) > 0 || "Price must be greater than 0" })}
              />
            </Field>
            <Field label="Stock count" htmlFor="stock" error={errors.stock?.message}>
              <input
                id="stock"
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                placeholder="25"
                disabled={submitting}
                className={inputClass(!!errors.stock)}
                {...register("stock", {
                  required: "Stock is required",
                  validate: (v) => (Number.isInteger(Number(v)) && Number(v) >= 0) || "Stock must be a whole number ≥ 0",
                })}
              />
            </Field>
          </div>

          <Toggle
            label="Is discounted"
            hint="Apply a percentage discount to this product"
            checked={isDiscounted}
            disabled={submitting}
            onChange={(v) => setValue("is_discounted", v, { shouldDirty: true })}
          />

          {isDiscounted && (
            <div className="animate-fade-in">
              <Field label="Discount percentage (%)" htmlFor="discount_percentage" error={errors.discount_percentage?.message}>
                <input
                  id="discount_percentage"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="10.00"
                  disabled={submitting}
                  className={inputClass(!!errors.discount_percentage)}
                  {...register("discount_percentage", {
                    validate: (v, form) => {
                      if (!form.is_discounted) return true;
                      const n = Number(v);
                      return (v !== "" && n > 0 && n < 100) || "Enter a percentage between 0 and 100";
                    },
                  })}
                />
              </Field>
              {price > 0 && discount > 0 && (
                <p className="mt-2 text-xs text-text-secondary">
                  Customers pay <span className="font-semibold text-success">{fmt(finalPrice)}</span> <span className="line-through text-text-muted">{fmt(price)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 3 — Images */}
        <div className={step === 2 ? "space-y-6" : "hidden"}>
          {/* Cover image: exactly one, required */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-xs font-semibold text-text-secondary">
                Cover image <span className="text-error">*</span>
              </p>
              <p className="text-xs text-text-muted">Shown on product cards & listings</p>
            </div>
            {cover || existingCover ? (
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-soft-background">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob or API-hosted image */}
                <img src={cover?.url ?? existingCover} alt="Cover image" className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {cover ? "Cover" : "Current cover"}
                </span>
                <div className="absolute right-3 top-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={submitting}
                    className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-text-secondary shadow hover:text-primary"
                  >
                    Replace
                  </button>
                  {cover && (
                    <button
                      type="button"
                      aria-label="Remove cover image"
                      onClick={removeCover}
                      disabled={submitting}
                      className="rounded-full bg-white/90 p-1.5 text-text-secondary shadow hover:text-error"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  pickCover(e.dataTransfer.files);
                }}
                onClick={() => !submitting && coverInputRef.current?.click()}
                className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 text-center transition-colors hover:border-primary hover:bg-hover-bg ${
                  imageError ? "border-error" : "border-border"
                }`}
              >
                <ImagePlus className="h-8 w-8 text-primary" />
                <p className="text-sm font-semibold text-text-primary">Upload cover image</p>
                <p className="text-xs text-text-muted">Click or drag & drop · PNG, JPG or WEBP</p>
              </div>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={(e) => pickCover(e.target.files)} />
            {imageError && <p className="mt-1 text-xs text-error">{imageError}</p>}
          </section>

          {/* Sub images: optional, many */}
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-xs font-semibold text-text-secondary">
                Gallery images <span className="font-normal text-text-muted">(optional)</span>
              </p>
              <p className="text-xs text-text-muted">{existingSubs.length + subImages.length} added</p>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addSubImages(e.dataTransfer.files);
              }}
              className="grid grid-cols-3 gap-3 sm:grid-cols-5"
            >
              {existingSubs.map((sub) => (
                <div key={sub.id} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-soft-background">
                  {/* eslint-disable-next-line @next/next/no-img-element -- API-hosted image */}
                  <img src={sub.image} alt="Saved gallery image" className="h-full w-full object-cover" />
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-text-secondary">Saved</span>
                </div>
              ))}
              {subImages.map((img, i) => (
                <div key={img.url} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-soft-background">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={img.url} alt={img.file.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove ${img.file.name}`}
                    onClick={() => removeSubImage(i)}
                    disabled={submitting}
                    className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-text-secondary shadow hover:text-error"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => subInputRef.current?.click()}
                disabled={submitting}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-text-muted transition-colors hover:border-primary hover:bg-hover-bg hover:text-primary disabled:opacity-50"
              >
                {existingSubs.length + subImages.length === 0 ? <Images className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                <span className="text-[11px] font-semibold">Add images</span>
              </button>
            </div>
            <input ref={subInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addSubImages(e.target.files)} />
          </section>
        </div>

        {/* Step 4 — Visibility & review */}
        <div className={step === 3 ? "space-y-4" : "hidden"}>
          <Toggle label="Is active" hint="Visible to customers in the store" checked={!!values.is_active} disabled={submitting} onChange={(v) => setValue("is_active", v)} />
          <Toggle label="Is discounted" hint="Apply a percentage discount (set on Pricing step)" checked={isDiscounted} disabled={submitting} onChange={(v) => setValue("is_discounted", v)} />
          <Toggle label="Bestseller" hint="Highlight with a bestseller badge" checked={!!values.is_bestseller} disabled={submitting} onChange={(v) => setValue("is_bestseller", v)} />

          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-soft-background p-4 text-sm">
            <dt className="text-text-muted">Category</dt>
            <dd className="font-medium text-text-primary">{categoryName}</dd>
            <dt className="text-text-muted">Name</dt>
            <dd className="truncate font-medium text-text-primary">{values.name || "—"}</dd>
            <dt className="text-text-muted">Price</dt>
            <dd className="font-medium text-text-primary">
              {fmt(finalPrice)}
              {discount > 0 && <span className="ml-1 text-xs text-success">({discount}% off)</span>}
            </dd>
            <dt className="text-text-muted">Stock</dt>
            <dd className="font-medium text-text-primary">{values.stock || "—"}</dd>
            <dt className="text-text-muted">Cover image</dt>
            <dd className="font-medium text-text-primary">{cover ? "New upload" : existingCover ? "Current" : "—"}</dd>
            <dt className="text-text-muted">Gallery images</dt>
            <dd className="font-medium text-text-primary">{existingSubs.length + subImages.length}</dd>
          </dl>
          {isDiscounted && !(discount > 0) && <p className="text-xs text-error">Discount is on but no percentage is set — go back to Pricing & stock.</p>}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0 || submitting}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:invisible"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {isEdit ? (submitting ? "Saving…" : "Save changes") : submitting ? "Creating…" : "Create product"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
