"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LoginForm } from "@/components/ui/LoginForm";
import { SignupForm } from "@/components/ui/SignupForm";

const TRANSITION_MS = 300;

type Phase = "closed" | "entering" | "open" | "leaving";

export function AuthModal() {
  const { isOpen, view, closeModal } = useAuthModal();
  const [phase, setPhase] = useState<Phase>("closed");

  if (isOpen && (phase === "closed" || phase === "leaving")) {
    setPhase("entering");
  } else if (!isOpen && (phase === "entering" || phase === "open")) {
    setPhase("leaving");
  }

  useEffect(() => {
    if (phase !== "entering") return;
    const raf = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timeout = window.setTimeout(() => setPhase("closed"), TRANSITION_MS);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  const mounted = phase !== "closed";
  const show = phase === "open";

  useEffect(() => {
    if (!mounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, closeModal]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-100 flex items-center justify-center overflow-y-auto p-4 transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        aria-hidden
        onClick={closeModal}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div
        className={`relative my-8 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card-background shadow-2xl shadow-primary/10 transition-all duration-300 ease-brand ${
          show ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="relative overflow-hidden bg-linear-to-br from-gradient-start to-gradient-end px-6 py-6 text-white sm:px-8">
          <div
            aria-hidden
            className="absolute -right-10 -top-14 h-40 w-40 animate-float rounded-full bg-white/10 blur-2xl"
          />

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>

          <Link
            href="/"
            onClick={closeModal}
            className="relative flex items-center gap-2 text-lg font-extrabold tracking-tight"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              N
            </span>
            Nova<span className="text-white/80">Shop</span>
          </Link>

          <h2 className="relative mt-4 text-xl font-bold">
            {view === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="relative mt-1 text-xs text-white/80">
            {view === "login"
              ? "Sign in to pick up right where you left off."
              : "Join NovaShop for member-only deals & faster checkout."}
          </p>
        </div>

        <div key={view} className="animate-fade-in max-h-[65vh] overflow-y-auto p-6 sm:p-8">
          {view === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
}
