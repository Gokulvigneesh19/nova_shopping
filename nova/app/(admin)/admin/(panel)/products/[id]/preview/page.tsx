import type { Metadata } from "next";
import { ProductPreviewView } from "@/components/admin/ProductPreviewView";

export const metadata: Metadata = {
  title: "Preview product — NovaShop Admin",
};

export default async function AdminProductPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductPreviewView id={id} />;
}
