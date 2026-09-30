"use client";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { useRouter } from "next/navigation";
import { signup } from "../services/auth.service";
import { auth } from "@/lib/auth";
import useAuthStore from "@/lib/globalstore/auth.store";
import { useModalStore } from "@/lib/globalstore/modal.store";




export function useSignup() {
    const router = useRouter();
    const { closeModal } = useModalStore();
    const { login } = useAuthStore();
    //   const queryClient = useQueryClient();

    return useCustomMutation(signup, {
        mutationKey: ["signup"],

        successMessage: "Signup Successful",

        onSuccess: async (data) => {
            auth.setTokens(
                data?.access,
                data?.refresh,
                (3 * 60 * 60 * 1000 + new Date().getTime()).toString(),
                data?.user?.is_host ? "admin" : "user"
            );

            closeModal();
            login(data?.user ?? null);
        },

        onError: (error) => {
            console.error(error);
            closeModal();
        },
    });
}