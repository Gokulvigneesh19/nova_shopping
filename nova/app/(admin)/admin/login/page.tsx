import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginView } from "@/components/admin/AdminLoginView";

export const metadata: Metadata = {
  title: "Admin Sign In — NovaShop",
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginView />
    </Suspense>
  );
}
