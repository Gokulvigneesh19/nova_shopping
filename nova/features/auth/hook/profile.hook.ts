import { useCustomQuery } from "@/lib/hooks/useCustomeQuery";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import useAuthStore from "@/lib/globalstore/auth.store";

import { getCartCount, getUserProfile, UserUpdate } from "../services/auth.service";
import { AuthResponse, ProfileUpdatePayload } from "../types/auth.types";

export function useProfile(enabled: boolean = true) {
  return useCustomQuery<AuthResponse>(
    ["userProfile"],
    (signal) => getUserProfile(signal),
     
    {
      staleTime: Infinity,
      enabled,
      refetchOnMount:true
    }
  );
}

// Fetched for guests and signed-in users; login invalidates it so the badge refreshes for the new session.
export function useCartCount(enabled: boolean = true) {
  return useCustomQuery<AuthResponse>(
    ["cartCount"],
    (signal) => getCartCount(signal),
    {
      staleTime: Infinity,
      enabled,
      refetchOnMount: true,
    }
  );
}

export function useUpdateProfile() {
  const { userProfile, login } = useAuthStore();

  return useCustomMutation((payload: ProfileUpdatePayload) => UserUpdate(payload), {
    mutationKey: ["updateProfile"],
    invalidateQueries: [["userProfile"]],
    successMessage: "Details saved",
    onSuccess: (data, payload) => {
      // Keep the store in sync so later diffs compare against the saved values.
      const merged = data?.user ?? (userProfile ? { ...userProfile, ...payload } : null);
      if (merged) login(merged);
    },
  });
}
