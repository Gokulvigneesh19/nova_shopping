import type { Metadata } from "next";
import { ReviewsView } from "@/components/admin/ReviewsView";

export const metadata: Metadata = {
  title: "Reviews & ratings — NovaShop Admin",
};

export default function AdminReviewsPage() {
  return <ReviewsView />;
}
