import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Page Not Found — NovaShop",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-20 sm:px-6">
        <div className="relative flex max-w-md flex-col items-center text-center animate-fade-in-up">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl"
          />

          <span className="relative bg-linear-to-br from-gradient-start to-gradient-end bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl">
            404
          </span>

          <div className="relative mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30 animate-float">
            <ShoppingBag className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-text-primary sm:text-3xl">
            This page wandered off the shelf
          </h1>
          <p className="mt-3 text-text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full bg-linear-to-br from-gradient-start to-gradient-end px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              href="/orders"
              className="flex items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-hover-bg hover:text-primary"
            >
              View my orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
