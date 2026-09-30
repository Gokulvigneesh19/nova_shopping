import type { Metadata } from "next";
import { ProductsView } from "@/components/admin/ProductsView";

export const metadata: Metadata = {
  title: "Products — NovaShop Admin",
};

export default function AdminProductsPage() {
  return <ProductsView />;
}
