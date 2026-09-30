import type { Metadata } from "next";
import { CategoryFormView } from "@/components/admin/CategoryFormView";

export const metadata: Metadata = {
  title: "Add category — NovaShop Admin",
};

export default function AdminCategoryCreatePage() {
  return <CategoryFormView />;
}
