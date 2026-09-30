import type { Metadata } from "next";
import { CustomersView } from "@/components/admin/CustomersView";

export const metadata: Metadata = {
  title: "Customers — NovaShop Admin",
};

export default function AdminCustomersPage() {
  return <CustomersView />;
}
