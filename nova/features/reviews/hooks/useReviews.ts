import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { createReview, getReviews } from "../services/review.service";
import { AdminReview } from "../types/review.types";

export function useReviews() {
  return useCustomQuery<AdminReview[]>(["reviews"], (signal) => getReviews(signal));
}

// Refreshes product data too, so ratings and reviews on product pages update.
export function useCreateReview() {
  return useCustomMutation(createReview, {
    mutationKey: ["createReview"],
    retry: 0,
    invalidateQueries: [["reviews"], ["products"]],
    successMessage: "Thanks for your review!",
  });
}
