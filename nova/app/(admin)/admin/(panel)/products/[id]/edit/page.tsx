import type { Metadata } from "next";
import { ProductCreateView } from "@/components/admin/ProductCreateView";

export const metadata: Metadata = {
  title: "Edit product — NovaShop Admin",
};

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductCreateView productId={id} />;
}
