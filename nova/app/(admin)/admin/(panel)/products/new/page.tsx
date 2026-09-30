import type { Metadata } from "next";
import { ProductCreateView } from "@/components/admin/ProductCreateView";

export const metadata: Metadata = {
  title: "Add product — NovaShop Admin",
};

export default function AdminProductCreatePage() {
  return <ProductCreateView />;
}
