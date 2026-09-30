import type { Metadata } from "next";
import { CouponsView } from "@/components/admin/CouponsView";

export const metadata: Metadata = {
  title: "Coupons — NovaShop Admin",
};

export default function AdminCouponsPage() {
  return <CouponsView />;
}
