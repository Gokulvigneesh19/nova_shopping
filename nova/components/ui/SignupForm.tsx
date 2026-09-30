"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { signup } from "@/features/auth/services/auth.service";
import { ApiError } from "@/lib/api/request";
import { auth } from "@/lib/auth";
import type { SignupPayload } from "@/features/auth/types/auth.types";
import { useModalStore } from "@/lib/globalstore/modal.store";
import { useSignup } from "@/features/auth/hook/signup.hook";

type SignupFormValues = SignupPayload & { agreed: boolean };

const phoneCodes = ["+91", "+1", "+44", "+61", "+971"];

export function SignupForm() {
  const router = useRouter();
  const { triggerModal, closeModal } = useModalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignupFormValues>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_code: "+91",
      phone_number: "",
      password: "",
      confirm_password: "",
      agreed: false,
    },
  });
  const signupMutation = useSignup();
  const submitting = signupMutation.isPending;

  const onSubmit = async ({ agreed, ...payload }: SignupFormValues) => {
    signupMutation.mutate(payload);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary">Create your account</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className="mb-1.5 block text-xs font-semibold text-text-secondary">
              First Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="first_name"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your first name"
                aria-invalid={errors.first_name ? "true" : "false"}
                disabled={submitting}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.first_name ? "border-error focus:border-error" : "border-border focus:border-primary"
                  }`}
                {...register("first_name", { required: "First name is required" })}
              />
            </div>
            {errors.first_name && <p className="mt-1 text-xs text-error">{errors.first_name.message}</p>}
          </div>

          <div>
            <label htmlFor="last_name" className="mb-1.5 block text-xs font-semibold text-text-secondary">
              Last Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="last_name"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
                aria-invalid={errors.last_name ? "true" : "false"}
                disabled={submitting}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.last_name ? "border-error focus:border-error" : "border-border focus:border-primary"
                  }`}
                {...register("last_name", { required: "Last name is required" })}
              />
            </div>
            {errors.last_name && <p className="mt-1 text-xs text-error">{errors.last_name.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-text-secondary">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              aria-invalid={errors.email ? "true" : "false"}
              disabled={submitting}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? "border-error focus:border-error" : "border-border focus:border-primary"
                }`}
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
              })}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone_number" className="mb-1.5 block text-xs font-semibold text-text-secondary">
            Phone Number
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Phone code"
              disabled={submitting}
              className="rounded-xl border border-border bg-card-background px-2.5 text-sm focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              {...register("phone_code", { required: true })}
            >
              {phoneCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="phone_number"
                type="tel"
                autoComplete="tel-national"
                placeholder="Enter your phone number"
                aria-invalid={errors.phone_number ? "true" : "false"}
                disabled={submitting}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.phone_number ? "border-error focus:border-error" : "border-border focus:border-primary"
                  }`}
                {...register("phone_number", { required: "Phone number is required" })}
              />
            </div>
          </div>
          {errors.phone_number && <p className="mt-1 text-xs text-error">{errors.phone_number.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-text-secondary">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your password"
                aria-invalid={errors.password ? "true" : "false"}
                disabled={submitting}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-11 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.password ? "border-error focus:border-error" : "border-border focus:border-primary"
                  }`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={submitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirm_password" className="mb-1.5 block text-xs font-semibold text-text-secondary">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="confirm_password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter your password again"
                aria-invalid={errors.confirm_password ? "true" : "false"}
                disabled={submitting}
                className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.confirm_password ? "border-error focus:border-error" : "border-border focus:border-primary"
                  }`}
                {...register("confirm_password", {
                  required: "Please confirm your password",
                  validate: (value) => value === getValues("password") || "Passwords do not match",
                })}
              />
            </div>
            {errors.confirm_password && <p className="mt-1 text-xs text-error">{errors.confirm_password.message}</p>}
          </div>
        </div>

        <div>
          <label className="flex select-none items-start gap-2 text-xs text-text-secondary">
            <input
              type="checkbox"
              disabled={submitting}
              className="mt-0.5 h-3.5 w-3.5 rounded accent-(--color-primary-purple) disabled:cursor-not-allowed disabled:opacity-50"
              {...register("agreed", { required: "You must agree to continue" })}
            />
            I agree to the{" "}
            <span className="font-semibold text-primary">Terms of Service</span> and{" "}
            <span className="font-semibold text-primary">Privacy Policy</span>
          </label>
          {errors.agreed && <p className="mt-1 text-xs text-error">{errors.agreed.message}</p>}
        </div>

        {formError && (
          <p className="animate-fade-in rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-xs font-medium text-error">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-gradient-start to-gradient-end py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {submitting ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => triggerModal("login")}
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
