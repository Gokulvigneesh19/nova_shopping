import { Review } from "@/features/products/types/product.types";

export interface CreateReviewPayload {
  product_id: string;
  rating: string;
  review: string;
}

// What the review modal needs: the delivered order and its products.
export interface ReviewModalData {
  orderId: string;
  orderLabel: string;
  products: { productId: string; name: string; image: string }[];
}

// Admin listing may carry product info alongside the base review.
export type AdminReview = Review & {
  product?: string;
  product_id?: string;
  product_name?: string;
  product_image?: string;
};
