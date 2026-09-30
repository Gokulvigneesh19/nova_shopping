"use client";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { loginApi } from "../services/auth.service";
import { auth } from "@/lib/auth";
import useAuthStore from "@/lib/globalstore/auth.store";
import { useModalStore } from "@/lib/globalstore/modal.store";

// Only allow same-origin admin paths from ?next= to avoid open redirects.
function getAdminRedirect() {
    const next = new URLSearchParams(window.location.search).get("next");
    if (!next || !next.startsWith("/admin") || next.startsWith("/admin/login")) return "/admin";
    return next;
}

export function useLogin() {
    const router = useRouter();
    const { closeModal } = useModalStore();
    const { login } = useAuthStore();
    const queryClient = useQueryClient();

    return useCustomMutation(loginApi, {
        mutationKey: ["login"],

        successMessage: "Login Successful",

        onSuccess: async (data) => {
            const isAdmin = !!data?.user?.is_host;

            auth.setTokens(
                data?.access,
                data?.refresh,
                (3 * 60 * 60 * 1000 + new Date().getTime()).toString(),
                isAdmin ? "admin" : "user"
            );

            closeModal();
            login(data?.user ?? null);

            // Refetch everything that depends on who is signed in: cart, cart count, profile
            // and the products' `is_cart_added` flags.
            ["cart", "cartCount", "userProfile", "products"].forEach((key) =>
                queryClient.invalidateQueries({ queryKey: [key] })
            );

            // Admins live in the admin panel; users are kept out of it.
            if (isAdmin) {
                router.replace(getAdminRedirect());
            } else if (window.location.pathname.startsWith("/admin")) {
                router.replace("/");
            }
        },

        onError: (error) => {
            console.error(error);
            closeModal();
        },
    });
}
