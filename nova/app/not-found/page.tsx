import { notFound } from "next/navigation";

// Redirect target for client-side 404s (see lib/api/request.ts) — renders app/not-found.tsx.
export default function NotFoundPage() {
  notFound();
}
