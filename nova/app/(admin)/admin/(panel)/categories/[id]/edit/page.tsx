import type { Metadata } from "next";
import { CategoryFormView } from "@/components/admin/CategoryFormView";

export const metadata: Metadata = {
  title: "Edit category — NovaShop Admin",
};

export default async function AdminCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryFormView categoryId={id} />;
}
