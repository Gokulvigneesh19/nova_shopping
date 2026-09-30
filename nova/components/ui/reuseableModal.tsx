"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const TRANSITION_MS = 300;

type Phase = "closed" | "entering" | "open" | "leaving";

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

type ReuseableModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
};

export function ReuseableModal({
  isOpen,
  onClose,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = "",
}: ReuseableModalProps) {
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
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

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
        onClick={closeOnBackdropClick ? onClose : undefined}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div
        className={`relative p-4 my-8 w-full ${sizeClasses[size]} overflow-hidden rounded-3xl border border-border bg-card-background shadow-2xl shadow-primary/10 transition-all duration-300 ease-brand ${
          show ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        } ${className}`}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-text-primary transition-colors hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
