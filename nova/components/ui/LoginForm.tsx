 "use client";
import { useModalStore } from "@/lib/globalstore/modal.store";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { ApiError } from "@/lib/api/request";
import { auth } from "@/lib/auth";
import type { LoginPayload } from "@/features/auth/types/auth.types";
import { useLogin } from "@/features/auth/hook/login.hook";

type LoginFormProps = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { triggerModal } = useModalStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({ defaultValues: { email: "", password: "" } });

  const loginMutation = useLogin();
  const submitting = loginMutation.isPending;

  const onSubmit = async (payload: LoginPayload) => {
    loginMutation.mutate(payload, { onSuccess: () => onSuccess?.() });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary">Welcome back</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
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
              placeholder="Enter your email"
              aria-invalid={errors.email ? "true" : "false"}
              disabled={submitting}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.email ? "border-error focus:border-error" : "border-border focus:border-primary"
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
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-semibold text-text-secondary">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={errors.password ? "true" : "false"}
              disabled={submitting}
              className={`w-full rounded-xl border py-2.5 pl-10 pr-11 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.password ? "border-error focus:border-error" : "border-border focus:border-primary"
              }`}
              {...register("password", { required: "Password is required" })}
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
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
      {pathname !== "/admin/login" && (
        <p className="mt-4 text-center text-sm text-text-secondary">
          New to NovaShop?{" "}
          <button
            type="button"
            onClick={() => triggerModal("signup")}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </button>
        </p>
      )}
    </div>
  );
}
