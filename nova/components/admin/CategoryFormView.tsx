"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Check, ImagePlus, Loader2, X } from "lucide-react";
import { Field, Toggle, inputClass } from "@/components/admin/FormControls";
import { useCategoriesbyID, useCreateCategory, useUpdateCategory } from "@/features/categories/hooks/useCategories";

type CategoryFormValues = {
  name: string;
  description: string;
  is_active: boolean;
};

export function CategoryFormView({ categoryId }: { categoryId?: string }) {
  const isEdit = !!categoryId;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const { data: category, isLoading, isError } = useCategoriesbyID(categoryId ?? "");
  const existingImage = category?.image ?  category.image : undefined;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const submitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: { name: "", description: "", is_active: true },
  });
  const isActive = !!useWatch({ control, name: "is_active" });

  useEffect(() => {
    if (!category) return;
    reset({
      name: category.name,
      description: category.description ?? "",
      is_active: category.is_active ?? true,
    });
  }, [category, reset]);

  // Revoke the preview URL when it changes or on unmount.
  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image.url);
  }, [image]);

  const pickFile = (files: FileList | null) => {
    const file = files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setImageError("Choose an image file");
    setImage({ file, url: URL.createObjectURL(file) });
    setImageError(null);
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (!image && !existingImage) return setImageError("Upload a category image");
    const payload = {
      name: data.name.trim(),
      description: data.description.trim(),
      is_active: data.is_active,
      image: image?.file ?? null,
    };
    const onSuccess = () => router.push("/admin/categories");
    if (categoryId) updateMutation.mutate({ id: categoryId, payload }, { onSuccess });
    else createMutation.mutate(payload, { onSuccess });
  };

  if (isEdit && (isLoading || isError || !category)) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-24 text-center">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <>
            <p className="text-error">{isError ? "Couldn’t load this category." : "Category not found."}</p>
            <Link href="/admin/categories" className="text-sm text-primary hover:underline">
              Back to categories
            </Link>
          </>
        )}
      </div>
    );
  }

  const preview = image?.url ?? existingImage;

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <Link href="/admin/categories" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to categories
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-2xl border border-border bg-card-background p-5 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-text-primary">{isEdit ? "Edit category" : "New category"}</h2>
          <p className="text-sm text-text-muted">Name, description, image & visibility</p>
        </div>

        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            placeholder="e.g. Electronics"
            disabled={submitting}
            className={inputClass(!!errors.name)}
            {...register("name", { required: "Name is required", validate: (v) => !!v.trim() || "Name is required" })}
          />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description?.message}>
          <textarea
            id="description"
            rows={3}
            placeholder="Describe the category"
            disabled={submitting}
            className={`${inputClass(!!errors.description)} resize-y`}
            {...register("description", { required: "Description is required", validate: (v) => !!v.trim() || "Description is required" })}
          />
        </Field>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-text-secondary">Image</p>
          {preview ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-soft-background">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob or API-hosted image */}
              <img src={preview} alt="Category image" className="h-full w-full object-cover" />
              {!image && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary">Current</span>}
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-text-secondary shadow hover:text-primary"
                >
                  Replace
                </button>
                {image && (
                  <button
                    type="button"
                    aria-label="Remove new image"
                    onClick={() => setImage(null)}
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
                pickFile(e.dataTransfer.files);
              }}
              onClick={() => !submitting && fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors hover:border-primary hover:bg-hover-bg ${
                imageError ? "border-error" : "border-border"
              }`}
            >
              <ImagePlus className="h-8 w-8 text-primary" />
              <p className="text-sm font-semibold text-text-primary">Click to upload or drag & drop</p>
              <p className="text-xs text-text-muted">PNG, JPG or WEBP</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => pickFile(e.target.files)} />
          {imageError && <p className="mt-1 text-xs text-error">{imageError}</p>}
        </div>

        <Toggle label="Is active" hint="Visible to customers in the store" checked={isActive} disabled={submitting} onChange={(v) => setValue("is_active", v)} />

        <div className="flex justify-end border-t border-border pt-5">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isEdit ? (submitting ? "Saving…" : "Save changes") : submitting ? "Creating…" : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}
