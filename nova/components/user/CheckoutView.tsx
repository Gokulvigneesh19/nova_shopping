"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import {
  ArrowRight,
  Briefcase,
  Check,
  CreditCard,
  Home,
  Lock,
  MapPin,
  MapPinned,
  MessageSquareText,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";
import { CouponBox } from "@/features/cart/components/CouponBox";
import { useWelcomeCouponPrompt } from "@/features/coupons/hooks/useWelcomeCoupon";
import { CartItem } from "@/features/cart/types/cart.type";
import useAuthStore from "@/lib/globalstore/auth.store";
import { useUpdateProfile } from "@/features/auth/hook/profile.hook";
import { ProfileUpdatePayload } from "@/features/auth/types/auth.types";
import { useAddresses, useCreateAddress } from "@/features/addresses/hooks/useAddresses";
import { Address, AddressPayload, AddressType } from "@/features/addresses/types/address.types";
import { useCheckoutOrder } from "@/features/orders/hooks/useOrders";
import { useRazorpayPayment } from "@/features/orders/hooks/useRazorpayPayment";
import { formatMoney } from "@/lib/utils/currency";

type CheckoutValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone_code: string;
  phone: string;
  customer_note: string;
};

const NOTE_MAX = 500;

const CONTACT_STEP = 0;
const ADDRESS_STEP = 1;
const PAYMENT_STEP = 2;

const steps: { key: string; title: string; subtitle: string; icon: typeof User; fields: FieldPath<CheckoutValues>[] }[] = [
  { key: "contact", title: "Contact", subtitle: "Who's ordering", icon: User, fields: ["first_name", "last_name", "email", "phone"] },
  // Address is validated by its own form / selection, not the main checkout form.
  { key: "address", title: "Address", subtitle: "Where it's going", icon: MapPin, fields: [] },
  { key: "payment", title: "Payment", subtitle: "Secure payment", icon: CreditCard, fields: ["customer_note"] },
];

// Razorpay collects the actual payment details in its own secure window.
const razorpayMethods = ["Cards", "UPI", "Netbanking", "Wallets"];

const addressTypes: { id: AddressType; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "other", label: "Other", icon: MapPinned },
];
const addressTypeIcon = (type: AddressType) => addressTypes.find((t) => t.id === type)?.icon ?? MapPinned;

// Checkout contact field -> profile field; only changed ones are PATCHed.
const profileFields: [keyof CheckoutValues, keyof ProfileUpdatePayload][] = [
  ["first_name", "first_name"],
  ["last_name", "last_name"],
  ["email", "email"],
  ["phone_code", "phone_code"],
  ["phone", "phone_number"],
];

const emptyAddress: AddressPayload = {
  address_type: "home",
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
};

const phoneCodes = ["+91", "+1", "+44", "+61", "+971"];

const unitPrice = (item: CartItem) => Number(item.price_after_discount || item.product_price);
const hasDiscount = (item: CartItem) => Number(item.discount_percentage) > 0;
const money = (n: number) => formatMoney(n);
const digits = (v: string) => v.replace(/\D/g, "");
const formatAddress = (a: Address) =>
  [a.address, a.city, `${a.state} ${a.postal_code}`.trim(), a.country].filter(Boolean).join(", ");

const inputBase =
  "w-full rounded-xl border bg-card-background px-4 py-2.5 text-sm transition-colors placeholder:text-text-muted focus:outline-none focus:ring-4 disabled:opacity-50";
const inputClass = (error?: boolean) =>
  `${inputBase} ${error ? "border-error focus:border-error focus:ring-error/10" : "border-border focus:border-primary focus:ring-primary/10"}`;

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-text-secondary">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-error">{error}</span>}
    </label>
  );
}

const Spinner = () => <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;

export function CheckoutView() {
  const router = useRouter();
  const { userProfile, isAuthenticated } = useAuthStore();
  const { data: cartData, isLoading: cartLoading } = useCart();
  const items = cartData?.cart.items ?? [];

  const [step, setStep] = useState(CONTACT_STEP);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const checkoutMutation = useCheckoutOrder();
  const { pay, busy: paymentBusy, status: paymentStatus } = useRazorpayPayment();
  const placing = checkoutMutation.isPending || paymentBusy;
  const autoAdvanced = useRef(false);

  const updateProfile = useUpdateProfile();
  const savingContact = updateProfile.isPending;

  // Saved addresses: `undefined` selection means "auto" (default or first), `null` means explicitly none.
  const { data: addresses = [], isLoading: addressesLoading, isError: addressesError, refetch: refetchAddresses } = useAddresses(isAuthenticated);
  const createAddressMutation = useCreateAddress();
  const savingAddress = createAddressMutation.isPending;
  const [pickedAddressId, setPickedAddressId] = useState<string | null | undefined>(undefined);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const autoAddressId = (addresses.find((a) => a.is_default) ?? addresses[0])?.id ?? null;
  const selectedAddressId = pickedAddressId === undefined ? autoAddressId : pickedAddressId;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
  const showAddressForm = !addressesLoading && (addresses.length === 0 || addingAddress);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<CheckoutValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_code: "+91",
      phone: "",
      customer_note: "",
    },
  });
  const values = useWatch({ control });

  // Separate form for adding a delivery address so its validation never blocks the rest of checkout.
  const addressForm = useForm<AddressPayload>({ defaultValues: emptyAddress });
  const addressErrors = addressForm.formState.errors;
  const addressType = useWatch({ control: addressForm.control, name: "address_type" });
  const addressCountry = useWatch({ control: addressForm.control, name: "country" });

  // Prefill contact from the signed-in profile without overwriting anything typed.
  useEffect(() => {
    if (!userProfile) return;
    const prefill: [FieldPath<CheckoutValues>, string | null | undefined][] = [
      ["first_name", userProfile.first_name],
      ["last_name", userProfile.last_name],
      ["email", userProfile.email],
      ["phone_code", userProfile.phone_code],
      ["phone", userProfile.phone_number],
    ];
    prefill.forEach(([field, value]) => {
      if (value && !getValues(field)) setValue(field, value);
    });

    // If the profile already covers every contact field, skip straight to Address (once).
    if (autoAdvanced.current) return;
    autoAdvanced.current = true;
    const contactFields = steps[CONTACT_STEP].fields;
    if (!contactFields.every((f) => String(getValues(f) ?? "").trim())) return;
    // Only validate once every field has a value, so a partial profile never shows errors.
    trigger(contactFields).then((valid) => {
      if (!valid) return;
      setCompleted((prev) => prev.map((c, i) => (i === CONTACT_STEP ? true : c)));
      setStep((current) => (current === CONTACT_STEP ? ADDRESS_STEP : current));
    });
  }, [userProfile, getValues, setValue, trigger]);

  // Amounts come straight from the cart API.
  const subtotal = Number(cartData?.cart.subtotal ?? 0);
  const savings = Number(cartData?.cart.discount ?? 0);
  const appliedCoupon = cartData?.cart.coupon?.is_applied ? cartData.cart.coupon : null;
  const couponDiscount = appliedCoupon ? Number(cartData?.cart.coupon_discount ?? 0) : 0;
  const totalSavings = savings + couponDiscount;

  // First-order shoppers get a welcome coupon, unless one is already on the cart.
  useWelcomeCouponPrompt(!cartLoading && !cartData?.cart.coupon);
  const total = Number(cartData?.cart.cart_amount ?? 0);
  const itemCount = cartData?.cart.total_items ?? items.reduce((n, i) => n + i.quantity, 0);

  const completeStep = (index: number) => {
    setCompleted((prev) => prev.map((c, i) => (i === index ? true : c)));
    setStep(Math.min(index + 1, steps.length - 1));
  };

  // Contact: validate, PATCH only the fields that differ from the profile, then move on.
  const saveContact = async () => {
    if (!(await trigger(steps[CONTACT_STEP].fields))) return;
    const current = getValues();
    const changes: ProfileUpdatePayload = {};
    profileFields.forEach(([formKey, profileKey]) => {
      const next = String(current[formKey] ?? "").trim();
      const saved = String(userProfile?.[profileKey] ?? "").trim();
      if (next !== saved) changes[profileKey] = next;
    });
    if (Object.keys(changes).length === 0) return completeStep(CONTACT_STEP);
    updateProfile.mutate(changes, { onSuccess: () => completeStep(CONTACT_STEP) });
  };

  const startNewAddress = () => {
    const contact = getValues();
    addressForm.reset({
      ...emptyAddress,
      name: `${contact.first_name} ${contact.last_name}`.trim(),
      phone: contact.phone,
      // The first address a user saves becomes their default.
      is_default: addresses.length === 0,
    });
    setAddingAddress(true);
    setAddressError(null);
  };

  const cancelNewAddress = () => {
    setAddingAddress(false);
    setAddressError(null);
    addressForm.clearErrors();
  };

  const saveNewAddress = addressForm.handleSubmit((data) => {
    const payload: AddressPayload = {
      ...data,
      name: data.name.trim(),
      phone: digits(data.phone),
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      postal_code: data.postal_code.trim(),
      country: data.country.trim(),
      // Nothing saved yet means this one must be the default.
      is_default: addresses.length === 0 ? true : data.is_default,
    };
    createAddressMutation.mutate(payload, {
      onSuccess: (created) => {
        setPickedAddressId(created.id);
        setAddingAddress(false);
        completeStep(ADDRESS_STEP);
      },
    });
  });

  const continueWithAddress = () => {
    if (showAddressForm) return saveNewAddress();
    if (!selectedAddress) {
      setAddressError("Select a delivery address or add a new one");
      return;
    }
    completeStep(ADDRESS_STEP);
  };

  const openStep = (index: number) => {
    // Only jump to steps already reached.
    if (index <= step || completed[index - 1]) setStep(index);
  };

  // Step 2 creates the order, steps 3-4 run in Razorpay; either way the user lands on the order page.
  const onPlaceOrder = (data: CheckoutValues) => {
    if (!selectedAddress) {
      setStep(ADDRESS_STEP);
      setAddressError("Select a delivery address or add a new one");
      return;
    }
    const note = data.customer_note.trim();
    checkoutMutation.mutate(
      { address_id: selectedAddress.id, ...(note && { customer_note: note }) },
      {
        onSuccess: (res) =>
          pay({
            ...res,
            prefill: {
              name: `${data.first_name} ${data.last_name}`.trim(),
              email: data.email,
              contact: `${data.phone_code}${digits(data.phone)}`,
            },
            onPaid: (order) => router.replace(`/orders/${order.id}?paid=1`),
            // The order exists but is unpaid; its page offers "Pay now" and "Cancel".
            onUnpaid: (order) => router.replace(`/orders/${order.id}`),
          }),
      }
    );
  };

  const onInvalid = (errs: Partial<Record<keyof CheckoutValues, unknown>>) => {
    const target = steps.findIndex((s) => s.fields.some((f) => f in errs));
    if (target !== -1) setStep(target);
  };

  const summaries = [
    [`${values.first_name ?? ""} ${values.last_name ?? ""}`.trim(), values.email, values.phone && `${values.phone_code} ${values.phone}`]
      .filter(Boolean)
      .join(" · "),
    selectedAddress ? `${selectedAddress.name} · ${formatAddress(selectedAddress)}` : "",
    values.customer_note?.trim() ? `Razorpay · Note: ${values.customer_note.trim()}` : "Razorpay",
  ];

  // The track runs between the first and last step centres (2/3 of the width).
  const progressWidth = (step / (steps.length - 1)) * (200 / 3);
  const isIndia = (addressCountry ?? "").trim().toLowerCase() === "india";

  // Checkout empties the cart server-side, so keep this page up while the order is being paid.
  if (!cartLoading && items.length === 0 && !placing && !checkoutMutation.data) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-hover-bg text-primary">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-xl font-bold text-text-primary">Your bag is empty</h1>
        <p className="mt-1 text-sm text-text-muted">Add a few things to your bag before checking out.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03]"
        >
          Continue shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const payLabel =
    paymentStatus === "verifying"
      ? "Confirming payment…"
      : paymentStatus === "open"
        ? "Waiting for payment…"
        : placing
          ? "Placing order…"
          : `Pay ${money(total)}`;

  const primaryButton =
    "flex items-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-primary">Bag</Link>
        <span>/</span>
        <span className="text-text-primary">Checkout</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="animate-fade-in-down text-2xl font-bold text-text-primary">Checkout</h1>
        <p className="flex items-center gap-1.5 text-xs text-text-muted">
          <Lock className="h-3.5 w-3.5 text-success" /> Secure, encrypted checkout
        </p>
      </div>

      {/* Stepper */}
      <div className="mt-6 animate-fade-in rounded-2xl border border-border bg-card-background p-4 sm:p-5">
        <ol className="relative grid grid-cols-3">
          <span className="absolute left-[16.66%] right-[16.66%] top-5 h-0.5 rounded-full bg-border" aria-hidden />
          <span
            className="absolute left-[16.66%] top-5 h-0.5 rounded-full bg-linear-to-r from-gradient-start to-gradient-end transition-all duration-500 ease-brand"
            style={{ width: `${progressWidth}%` }}
            aria-hidden
          />
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = completed[i];
            const active = step === i;
            const reachable = i <= step || completed[i - 1];
            return (
              <li key={s.key} className="relative flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => openStep(i)}
                  disabled={!reachable || placing}
                  aria-current={active ? "step" : undefined}
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ease-brand disabled:cursor-not-allowed ${
                    done
                      ? "border-transparent bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30"
                      : active
                        ? "border-primary bg-card-background text-primary ring-4 ring-primary/10"
                        : "border-border bg-card-background text-text-muted"
                  }`}
                >
                  {done && !active ? <Check className="h-4.5 w-4.5" /> : <Icon className="h-4.5 w-4.5" />}
                </button>
                <span className={`mt-2 text-xs font-semibold sm:text-sm ${active || done ? "text-text-primary" : "text-text-muted"}`}>
                  <span className="hidden sm:inline">{i + 1}. </span>
                  {s.title}
                </span>
                <span className="hidden text-[11px] text-text-muted sm:block">{s.subtitle}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <form
        onSubmit={handleSubmit(onPlaceOrder, onInvalid)}
        onKeyDown={(e) => {
          // Enter should never place the order from the contact or address steps.
          if (e.key !== "Enter" || !(e.target instanceof HTMLInputElement) || step === PAYMENT_STEP) return;
          e.preventDefault();
          if (step === CONTACT_STEP) saveContact();
          else continueWithAddress();
        }}
        noValidate
        className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-4">
          {steps.map((s, i) => {
            const active = step === i;
            const done = completed[i];
            return (
              <section
                key={s.key}
                className={`overflow-hidden rounded-2xl border bg-card-background transition-all duration-300 ${
                  active ? "border-primary/40 shadow-lg shadow-primary/5" : "border-border"
                }`}
              >
                <header className="flex items-center gap-3 p-5 sm:px-6">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done && !active ? "bg-success/10 text-success" : active ? "bg-hover-bg text-primary" : "bg-soft-background text-text-muted"
                    }`}
                  >
                    {done && !active ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className={`text-base font-bold ${active || done ? "text-text-primary" : "text-text-muted"}`}>{s.title}</h2>
                    {!active && done && <p className="truncate text-xs text-text-secondary">{summaries[i]}</p>}
                  </div>
                  {!active && done && (
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      disabled={placing}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:bg-hover-bg"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  )}
                </header>

                <div className={active ? "animate-fade-in border-t border-border p-5 sm:p-6" : "hidden"}>
                  {/* 1. Contact */}
                  {i === CONTACT_STEP && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="First name" error={errors.first_name?.message}>
                        <input
                          autoComplete="given-name"
                          placeholder="Enter your first name"
                          className={inputClass(!!errors.first_name)}
                          {...register("first_name", {
                            required: "First name is required",
                            validate: (v) => v.trim().length >= 2 || "Enter at least 2 characters",
                          })}
                        />
                      </Field>
                      <Field label="Last name" error={errors.last_name?.message}>
                        <input
                          autoComplete="family-name"
                          placeholder="Enter your last name"
                          className={inputClass(!!errors.last_name)}
                          {...register("last_name", { required: "Last name is required", validate: (v) => !!v.trim() || "Last name is required" })}
                        />
                      </Field>
                      <Field label="Email" error={errors.email?.message} className="sm:col-span-2">
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="Enter your email"
                          className={inputClass(!!errors.email)}
                          {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })}
                        />
                        <span className="mt-1 block text-[11px] text-text-muted">We&apos;ll send your order confirmation here.</span>
                      </Field>
                      <Field label="Phone number" error={errors.phone?.message} className="sm:col-span-2">
                        <div className="flex gap-2">
                          <select aria-label="Country code" className={`${inputClass()} w-24 px-2.5`} {...register("phone_code")}>
                            {phoneCodes.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            placeholder="Enter your phone number"
                            className={inputClass(!!errors.phone)}
                            {...register("phone", {
                              required: "Phone number is required",
                              validate: (v, f) =>
                                f.phone_code === "+91"
                                  ? /^[6-9]\d{9}$/.test(digits(v)) || "Enter a valid 10-digit mobile number"
                                  : (digits(v).length >= 7 && digits(v).length <= 15) || "Enter a valid phone number",
                            })}
                          />
                        </div>
                      </Field>
                    </div>
                  )}

                  {/* 2. Address */}
                  {i === ADDRESS_STEP && (
                    <div className="space-y-4">
                      {addressesLoading && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Loading addresses">
                          {Array.from({ length: 2 }, (_, k) => (
                            <div key={k} className="space-y-3 rounded-xl border border-border p-4">
                              <div className="flex items-center gap-2.5">
                                <span className="h-9 w-9 animate-pulse rounded-lg bg-hover-bg" />
                                <div className="flex-1 space-y-1.5">
                                  <div className="h-3.5 w-1/2 animate-pulse rounded bg-hover-bg" />
                                  <div className="h-2.5 w-1/4 animate-pulse rounded bg-hover-bg" />
                                </div>
                              </div>
                              <div className="h-3 w-full animate-pulse rounded bg-hover-bg" />
                              <div className="h-3 w-2/3 animate-pulse rounded bg-hover-bg" />
                            </div>
                          ))}
                        </div>
                      )}

                      {addressesError && !addressesLoading && (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
                          Couldn&apos;t load your saved addresses.
                          <button type="button" onClick={() => refetchAddresses()} className="font-semibold underline">
                            Retry
                          </button>
                        </div>
                      )}

                      {/* Saved addresses */}
                      {!addressesLoading && addresses.length > 0 && !addingAddress && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery address">
                            {addresses.map((a) => {
                              const selected = a.id === selectedAddressId;
                              const TypeIcon = addressTypeIcon(a.address_type);
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => {
                                    // Clicking the selected card again deselects it.
                                    setPickedAddressId(selected ? null : a.id);
                                    setAddressError(null);
                                  }}
                                  className={`relative flex h-full flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200 ${
                                    selected ? "border-primary bg-hover-bg ring-4 ring-primary/10" : "border-border hover:border-primary/40 hover:shadow-sm"
                                  }`}
                                >
                                  <span className="flex items-center gap-2.5">
                                    <span
                                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                        selected ? "bg-primary text-white" : "bg-soft-background text-primary"
                                      }`}
                                    >
                                      <TypeIcon className="h-4.5 w-4.5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate text-sm font-semibold text-text-primary">{a.name}</span>
                                      <span className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{a.address_type}</span>
                                        {a.is_default && (
                                          <span className="rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary">
                                            Default
                                          </span>
                                        )}
                                      </span>
                                    </span>
                                    <span
                                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                        selected ? "border-primary bg-primary text-white" : "border-border"
                                      }`}
                                    >
                                      {selected && <Check className="h-3 w-3" />}
                                    </span>
                                  </span>

                                  <span className="flex-1 text-xs leading-relaxed text-text-secondary">
                                    <span className="line-clamp-2 whitespace-pre-line">{a.address}</span>
                                    <span className="block">
                                      {a.city}, {a.state} {a.postal_code}
                                    </span>
                                    <span className="block">{a.country}</span>
                                  </span>

                                  {a.phone && (
                                    <span className="border-t border-border pt-2 text-xs text-text-muted">Phone: {a.phone}</span>
                                  )}
                                </button>
                              );
                            })}

                            <button
                              type="button"
                              onClick={startNewAddress}
                              className="flex min-h-40 h-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:bg-hover-bg hover:text-primary"
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-background">
                                <Plus className="h-5 w-5" />
                              </span>
                              Add new address
                            </button>
                          </div>
                          {addressError && <p className="text-xs text-error">{addressError}</p>}
                        </div>
                      )}

                      {/* New address form */}
                      {showAddressForm && (
                        <div className="animate-fade-in space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-text-primary">
                              {addresses.length === 0 ? "Add a delivery address" : "New address"}
                            </p>
                            {addresses.length > 0 && (
                              <button type="button" onClick={cancelNewAddress} className="text-xs font-semibold text-primary hover:underline">
                                Use a saved address
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Address type">
                            {addressTypes.map(({ id, label, icon: Icon }) => (
                              <button
                                key={id}
                                type="button"
                                role="radio"
                                aria-checked={addressType === id}
                                onClick={() => addressForm.setValue("address_type", id)}
                                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                                  addressType === id
                                    ? "border-transparent bg-linear-to-r from-gradient-start to-gradient-end text-white shadow-md shadow-primary/25"
                                    : "border-border text-text-secondary hover:border-primary/40 hover:text-primary"
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" /> {label}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Full name" error={addressErrors.name?.message}>
                              <input
                                autoComplete="name"
                                placeholder="Who should receive it"
                                className={inputClass(!!addressErrors.name)}
                                {...addressForm.register("name", {
                                  required: "Name is required",
                                  validate: (v) => v.trim().length >= 2 || "Enter at least 2 characters",
                                })}
                              />
                            </Field>
                            <Field label="Phone number" error={addressErrors.phone?.message}>
                              <input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                placeholder="9876543210"
                                className={inputClass(!!addressErrors.phone)}
                                {...addressForm.register("phone", {
                                  required: "Phone number is required",
                                  validate: (v, f) =>
                                    f.country.trim().toLowerCase() === "india"
                                      ? /^[6-9]\d{9}$/.test(digits(v)) || "Enter a valid 10-digit mobile number"
                                      : (digits(v).length >= 7 && digits(v).length <= 15) || "Enter a valid phone number",
                                })}
                              />
                            </Field>
                            <Field label="Address" error={addressErrors.address?.message} className="sm:col-span-2">
                              <textarea
                                rows={2}
                                autoComplete="street-address"
                                placeholder="House no., building, street, area, landmark"
                                className={`${inputClass(!!addressErrors.address)} resize-none`}
                                {...addressForm.register("address", {
                                  required: "Address is required",
                                  validate: (v) => v.trim().length >= 5 || "Enter a complete address",
                                })}
                              />
                            </Field>
                            <Field label="City" error={addressErrors.city?.message}>
                              <input
                                autoComplete="address-level2"
                                placeholder="Madurai"
                                className={inputClass(!!addressErrors.city)}
                                {...addressForm.register("city", {
                                  required: "City is required",
                                  validate: (v) => /^[\p{L} .'-]{2,}$/u.test(v.trim()) || "Enter a valid city",
                                })}
                              />
                            </Field>
                            <Field label="State" error={addressErrors.state?.message}>
                              <input
                                autoComplete="address-level1"
                                placeholder="Tamil Nadu"
                                className={inputClass(!!addressErrors.state)}
                                {...addressForm.register("state", {
                                  required: "State is required",
                                  validate: (v) => /^[\p{L} .'-]{2,}$/u.test(v.trim()) || "Enter a valid state",
                                })}
                              />
                            </Field>
                            <Field label={isIndia ? "PIN code" : "Postal code"} error={addressErrors.postal_code?.message}>
                              <input
                                inputMode={isIndia ? "numeric" : "text"}
                                autoComplete="postal-code"
                                placeholder={isIndia ? "625001" : "Postal code"}
                                maxLength={isIndia ? 6 : 10}
                                className={inputClass(!!addressErrors.postal_code)}
                                {...addressForm.register("postal_code", {
                                  required: "Postal code is required",
                                  validate: (v, f) =>
                                    f.country.trim().toLowerCase() === "india"
                                      ? /^[1-9]\d{5}$/.test(v.trim()) || "Enter a valid 6-digit PIN code"
                                      : /^[A-Za-z0-9 -]{3,10}$/.test(v.trim()) || "Enter a valid postal code",
                                })}
                              />
                            </Field>
                            <Field label="Country" error={addressErrors.country?.message}>
                              <input
                                autoComplete="country-name"
                                className={inputClass(!!addressErrors.country)}
                                {...addressForm.register("country", {
                                  required: "Country is required",
                                  validate: (v) => /^[\p{L} .'-]{2,}$/u.test(v.trim()) || "Enter a valid country",
                                })}
                              />
                            </Field>
                          </div>

                          {addresses.length > 0 ? (
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                              <input type="checkbox" className="h-4 w-4 accent-(--color-primary-purple)" {...addressForm.register("is_default")} />
                              Make this my default address
                            </label>
                          ) : (
                            <p className="text-xs text-text-muted">This will be saved as your default address.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Payment */}
                  {i === PAYMENT_STEP && (
                    <div className="space-y-5">
                      <div className="flex items-start gap-4 rounded-2xl border border-primary/20 bg-hover-bg p-5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30">
                          <ShieldCheck className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary">Pay securely with Razorpay</p>
                          <p className="mt-0.5 text-sm text-text-secondary">
                            Clicking pay opens Razorpay&apos;s secure window, where you choose how to pay. Your card and bank details never touch our servers.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {razorpayMethods.map((m) => (
                              <span key={m} className="rounded-full border border-border bg-card-background px-2.5 py-1 text-[11px] font-semibold text-text-secondary">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Field label="Order note (optional)" error={errors.customer_note?.message}>
                        <div className="relative">
                          <MessageSquareText className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-text-muted" />
                          <textarea
                            rows={3}
                            maxLength={NOTE_MAX}
                            placeholder="Delivery instructions, gift message…"
                            className={`${inputClass(!!errors.customer_note)} resize-none pl-10`}
                            {...register("customer_note", {
                              maxLength: { value: NOTE_MAX, message: `Keep it under ${NOTE_MAX} characters` },
                            })}
                          />
                        </div>
                        <span className="mt-1 block text-right text-[11px] text-text-muted">
                          {(values.customer_note ?? "").length}/{NOTE_MAX}
                        </span>
                      </Field>

                      {paymentStatus === "open" && (
                        <p className="flex items-center gap-2 rounded-xl bg-soft-background px-4 py-3 text-sm text-text-secondary animate-fade-in">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                          Complete your payment in the Razorpay window…
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-3">
                    {i > 0 ? (
                      <button
                        type="button"
                        onClick={() => setStep(i - 1)}
                        disabled={placing || savingAddress}
                        className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        Back
                      </button>
                    ) : (
                      <span />
                    )}

                    {i === CONTACT_STEP && (
                      <button type="button" onClick={saveContact} disabled={savingContact} className={primaryButton}>
                        {savingContact && <Spinner />}
                        {savingContact ? "Saving…" : "Save & continue"}
                        {!savingContact && <ArrowRight className="h-4 w-4" />}
                      </button>
                    )}

                    {i === ADDRESS_STEP && (
                      <button
                        type="button"
                        onClick={continueWithAddress}
                        disabled={savingAddress || addressesLoading}
                        className={primaryButton}
                      >
                        {savingAddress && <Spinner />}
                        {savingAddress ? "Saving…" : showAddressForm ? "Save & continue" : "Continue to payment"}
                        {!savingAddress && <ArrowRight className="h-4 w-4" />}
                      </button>
                    )}

                    {i === PAYMENT_STEP && (
                      <button type="submit" disabled={placing || cartLoading} className={`${primaryButton} lg:hidden`}>
                        {placing ? <Spinner /> : <Lock className="h-4 w-4" />}
                        {payLabel}
                      </button>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Order summary */}
        <aside className="h-fit animate-fade-in-up space-y-4 lg:sticky lg:top-24 [animation-delay:150ms]">
          <div className="rounded-2xl border border-border bg-card-background p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Order summary</h2>
              <Link href="/cart" className="text-xs font-semibold text-primary hover:underline">
                Edit bag
              </Link>
            </div>
            <p className="text-xs text-text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>

            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
              {cartLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="h-14 w-14 animate-pulse rounded-xl bg-hover-bg" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-3/4 animate-pulse rounded bg-hover-bg" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-hover-bg" />
                      </div>
                    </li>
                  ))
                : items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element -- API-hosted image */}
                      <img
                        src={process.env.NEXT_PUBLIC_IMAGE_URL + item.image}
                        alt={item.product_name}
                        className="h-14 w-14 shrink-0 rounded-xl border border-border bg-soft-background object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">{item.product_name}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-text-muted">
                          <span>Qty {item.quantity} × {money(unitPrice(item))}</span>
                          {hasDiscount(item) && (
                            <>
                              <span className="line-through">{money(Number(item.product_price))}</span>
                              <span className="font-semibold text-success">{Number(item.discount_percentage)}% off</span>
                            </>
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-text-primary">{money(Number(item.total_price ?? unitPrice(item) * item.quantity))}</span>
                    </li>
                  ))}
            </ul>

            {selectedAddress && completed[ADDRESS_STEP] && (
              <div className="mt-4 rounded-xl bg-soft-background p-3 text-xs">
                <p className="flex items-center gap-1.5 font-semibold text-text-primary">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Delivering to {selectedAddress.name}
                </p>
                <p className="mt-1 text-text-secondary">{formatAddress(selectedAddress)}</p>
              </div>
            )}

            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-text-secondary">
                <dt>
                  Subtotal <span className="text-text-muted">({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                </dt>
                <dd className="text-text-primary">{money(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Discount</dt>
                  <dd>−{money(savings)}</dd>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success animate-fade-in">
                  <dt>
                    Coupon <span className="font-mono text-xs font-bold">({appliedCoupon?.code})</span>
                  </dt>
                  <dd>−{money(couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-text-secondary">
                <dt>Shipping &amp; taxes</dt>
                <dd className="text-xs text-text-muted">Added when order is placed</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-text-primary">
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>

            <CouponBox coupon={cartData?.cart.coupon} couponDiscount={cartData?.cart.coupon_discount} disabled={placing} />

            {totalSavings > 0 && (
              <p className="mt-4 rounded-xl bg-success/10 px-3 py-2 text-center text-xs font-semibold text-success">
                You&apos;re saving {money(totalSavings)}
                {subtotal > 0 && ` (${Math.round((totalSavings / subtotal) * 100)}%)`} on this order
              </p>
            )}

            <button
              type="submit"
              disabled={step !== PAYMENT_STEP || placing || cartLoading}
              className="mt-6 hidden w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 lg:flex"
            >
              {placing ? <Spinner /> : <Lock className="h-4 w-4" />}
              {payLabel}
            </button>
            {step !== PAYMENT_STEP && (
              <p className="mt-2 hidden text-center text-xs text-text-muted lg:block">Complete contact and address to pay</p>
            )}
          </div>

          <ul className="grid grid-cols-3 gap-2 text-center text-[11px] text-text-muted">
            {[
              { icon: ShieldCheck, label: "Secure payment" },
              { icon: Truck, label: "Fast delivery" },
              { icon: RotateCcw, label: "30-day returns" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card-background px-2 py-3">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </li>
            ))}
          </ul>
        </aside>
      </form>
    </div>
  );
}
