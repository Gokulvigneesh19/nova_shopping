"use client";

import { LoginForm } from "@/components/ui/LoginForm";

// Post-login routing (admin → ?next or /admin, user → /) lives in useLogin,
// and proxy.ts keeps signed-in visitors off this page.
export function AdminLoginView() {
  return (
    <div className="mx-auto flex flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-border bg-card-background shadow-2xl shadow-primary/10 md:grid-cols-2">
        <div className="p-6 sm:p-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
