"use client";

import { useForm, useWatch } from "react-hook-form";
import { IndianRupee, Loader2, Percent, TicketPercent } from "lucide-react";
import { Field, Toggle, inputClass } from "@/components/admin/FormControls";
import { useCreateCoupon, useUpdateCoupon } from "@/features/coupons/hooks/useCoupons";
import { Coupon, CouponPayload, DiscountType } from "@/features/coupons/types/coupon.types";
import { discountTypeOf, isoToLocalInput, localInputToIso } from "@/features/coupons/utils";
import { formatCurrency } from "@/features/admin/data/mock";

type FormValues = {
  code: string;
  description: string;
  discount_type: DiscountType;
  /** The value for whichever discount type is selected. */
  discount_value: string;
  min_order_amount: string;
  start_date: string;
  end_date: string;
  active: boolean;
  only_for_new: boolean;
};

const CODE_PATTERN = /^[A-Z0-9_-]{3,50}$/;

const discountTypes: { id: DiscountType; label: string; icon: typeof Percent }[] = [
  { id: "percentage", label: "Percentage", icon: Percent },
  { id: "amount", label: "Fixed amount", icon: IndianRupee },
];

const toFormValues = (c?: Coupon | null): FormValues => {
  const type = c ? discountTypeOf(c) : "percentage";
  const value = c ? (type === "amount" ? c.discount_amount : c.discount_percentage) : null;
  return {
    code: c?.code ?? "",
    description: c?.description ?? "",
    discount_type: type,
    discount_value: value != null ? String(Number(value)) : "",
    min_order_amount: c ? String(Number(c.min_order_amount)) : "0",
    // New coupons start now, matching the model's default.
    start_date: isoToLocalInput(c?.start_date ?? new Date().toISOString()),
    end_date: isoToLocalInput(c?.end_date ?? null),
    active: c?.active ?? true,
    only_for_new: c?.only_for_new ?? false,
  };
};

const toPayload = (v: FormValues): CouponPayload => ({
  code: v.code.trim().toUpperCase(),
  description: v.description.trim(),
  // Only the selected discount is sent; the other is cleared.
  discount_percentage: v.discount_type === "percentage" ? Number(v.discount_value).toFixed(2) : "0.00",
  discount_amount: v.discount_type === "amount" ? Number(v.discount_value).toFixed(2) : "0.00",
  min_order_amount: Number(v.min_order_amount || 0).toFixed(2),
  start_date: localInputToIso(v.start_date) ?? new Date().toISOString(),
  end_date: localInputToIso(v.end_date),
  active: v.active,
  only_for_new: v.only_for_new,
});

export function CouponForm({ coupon, onDone }: { coupon?: Coupon | null; onDone: () => void }) {
  const isEdit = !!coupon;
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const saving = createCoupon.isPending || updateCoupon.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: toFormValues(coupon) });
  const active = useWatch({ control, name: "active" });
  const onlyForNew = useWatch({ control, name: "only_for_new" });
  const discountType = useWatch({ control, name: "discount_type" });
  const discountValue = useWatch({ control, name: "discount_value" });
  const code = useWatch({ control, name: "code" });
  const isAmount = discountType === "amount";
  const discountPreview =
    discountValue && Number(discountValue) > 0
      ? isAmount
        ? `${formatCurrency(Number(discountValue))} off`
        : `${Number(discountValue)}% off`
      : null;

  const onSubmit = handleSubmit((values) => {
    const payload = toPayload(values);
    if (!coupon) {
      createCoupon.mutate(payload, { onSuccess: onDone });
      return;
    }
    // PATCH only the fields that actually changed.
    const original = toPayload(toFormValues(coupon));
    const changes = Object.fromEntries(
      (Object.keys(payload) as (keyof CouponPayload)[])
        .filter((k) => payload[k] !== original[k])
        .map((k) => [k, payload[k]])
    ) as Partial<CouponPayload>;
    if (Object.keys(changes).length === 0) return onDone();
    updateCoupon.mutate({ id: coupon.id, payload: changes }, { onSuccess: onDone });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 p-2">
      <div className="flex items-center gap-3 pr-8">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30">
          <TicketPercent className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-text-primary">{isEdit ? "Edit coupon" : "New coupon"}</h2>
          <p className="text-sm text-text-muted">
            {code || discountPreview ? (
              <>
                <span className="font-mono font-semibold text-text-primary">{(code || "CODE").toUpperCase()}</span>
                {discountPreview && <> gives {discountPreview}</>}
              </>
            ) : (
              "Customers enter this code at checkout."
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Code" htmlFor="coupon-code" error={errors.code?.message}>
          <input
            id="coupon-code"
            placeholder="SUMMER20"
            maxLength={50}
            disabled={saving}
            className={`${inputClass(!!errors.code)} font-mono uppercase tracking-wide placeholder:font-sans placeholder:normal-case`}
            {...register("code", {
              required: "Code is required",
              setValueAs: (v: string) => v.toUpperCase(),
              validate: (v) => CODE_PATTERN.test(v.trim().toUpperCase()) || "3–50 letters, numbers, dashes or underscores",
            })}
          />
        </Field>

        <Field label={isAmount ? "Discount amount" : "Discount percentage"} htmlFor="coupon-discount" error={errors.discount_value?.message}>
          <div className="flex gap-2">
            <div className="flex shrink-0 rounded-xl border border-border bg-soft-background p-0.5" role="radiogroup" aria-label="Discount type">
              {discountTypes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={discountType === id}
                  aria-label={label}
                  title={label}
                  disabled={saving}
                  onClick={() => setValue("discount_type", id, { shouldValidate: !!errors.discount_value })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    discountType === id ? "bg-card-background text-primary shadow-sm" : "text-text-muted hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <input
              id="coupon-discount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max={isAmount ? undefined : "100"}
              placeholder={isAmount ? "500" : "20"}
              disabled={saving}
              className={inputClass(!!errors.discount_value)}
              {...register("discount_value", {
                required: "Discount is required",
                validate: (v, f) => {
                  const n = Number(v);
                  if (!Number.isFinite(n) || n <= 0) return "Enter a value above 0";
                  if (f.discount_type === "percentage" && n > 100) return "A percentage can't be more than 100";
                  if (f.discount_type === "amount" && Number(f.min_order_amount) > 0 && n > Number(f.min_order_amount))
                    return "Can't be more than the minimum order amount";
                  return /^\d+(\.\d{1,2})?$/.test(v) || "Use at most 2 decimal places";
                },
              })}
            />
          </div>
          <span className="mt-1 block text-[11px] text-text-muted">
            {isAmount ? "A flat amount taken off the order." : "A share of the order subtotal, up to 100%."}
          </span>
        </Field>

        <Field label="Description" htmlFor="coupon-description" error={errors.description?.message}>
          <textarea
            id="coupon-description"
            rows={2}
            placeholder="e.g. Summer sale 2026"
            disabled={saving}
            className={`${inputClass(!!errors.description)} resize-none`}
            {...register("description", {
              required: "Description is required",
              validate: (v) => v.trim().length >= 3 || "Enter at least 3 characters",
            })}
          />
        </Field>

        <Field label="Minimum order amount" htmlFor="coupon-min" error={errors.min_order_amount?.message}>
          <input
            id="coupon-min"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            disabled={saving}
            className={inputClass(!!errors.min_order_amount)}
            {...register("min_order_amount", {
              validate: (v) => {
                if (v === "") return true;
                const n = Number(v);
                return (Number.isFinite(n) && n >= 0) || "Enter 0 or more";
              },
            })}
          />
          <span className="mt-1 block text-[11px] text-text-muted">Order subtotal needed to use the code. 0 = no minimum.</span>
        </Field>

        <Field label="Starts" htmlFor="coupon-start" error={errors.start_date?.message}>
          <input
            id="coupon-start"
            type="datetime-local"
            disabled={saving}
            className={inputClass(!!errors.start_date)}
            {...register("start_date", { required: "Start date is required" })}
          />
        </Field>

        <Field label="Ends (optional)" htmlFor="coupon-end" error={errors.end_date?.message}>
          <input
            id="coupon-end"
            type="datetime-local"
            disabled={saving}
            className={inputClass(!!errors.end_date)}
            {...register("end_date", {
              // Mirrors the model constraint: end_date must be after start_date.
              validate: (v, f) => !v || !f.start_date || new Date(v) > new Date(f.start_date) || "Must be after the start date",
            })}
          />
          <span className="mt-1 block text-[11px] text-text-muted">Leave empty to never expire.</span>
        </Field>
      </div>

      <Toggle
        label="Active"
        hint="Inactive codes can't be used, even inside their date range"
        checked={!!active}
        disabled={saving}
        onChange={(v) => setValue("active", v, { shouldDirty: true })}
      />

      <Toggle
        label="New customers only"
        hint="Only shoppers placing their first order can use this code"
        checked={!!onlyForNew}
        disabled={saving}
        onChange={(v) => setValue("only_for_new", v, { shouldDirty: true })}
      />

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onDone}
          disabled={saving}
          className="rounded-full px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-hover-bg disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save changes" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}
