import type { Metadata } from "next";
import { DashboardView } from "@/components/admin/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard — NovaShop Admin",
};

export default function AdminDashboardPage() {
  return <DashboardView />;
}
