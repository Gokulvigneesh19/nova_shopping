import type { Metadata } from "next";
import { CategoriesView } from "@/components/admin/CategoriesView";

export const metadata: Metadata = {
  title: "Categories — NovaShop Admin",
};

export default function AdminCategoriesPage() {
  return <CategoriesView />;
}
