import { API } from "@/lib/api/endpoints";
import { request } from "@/lib/api/request";
import { AdminReview, CreateReviewPayload } from "@/features/reviews/types/review.types";

type ReviewResponse =
  | AdminReview[]
  | { message?: string; reviews?: AdminReview[]; results?: AdminReview[]; data?: AdminReview[] };

// The API may return a bare array or wrap it; normalise to AdminReview[].
export const getReviews = async (signal?: AbortSignal): Promise<AdminReview[]> => {
  const res = await request<ReviewResponse>(API.users.reviews, {
    method: "GET",
    signal,
  });
  if (Array.isArray(res)) return res;
  return res.reviews ?? res.results ?? res.data ?? [];
};

export const createReview = (payload: CreateReviewPayload) =>
  request<unknown, CreateReviewPayload>(API.users.reviews, { method: "POST", body: payload });
