"use client";

import { useModalStore } from "@/lib/globalstore/modal.store"
import { ReuseableModal } from "./reuseableModal"
import { LoginForm } from "./LoginForm"
import { SignupForm } from "./SignupForm";
import { ReviewForm } from "./ReviewForm";
import { WelcomeCoupons } from "./WelcomeCoupons";
import { WELCOME_COUPON_MODAL } from "@/features/coupons/hooks/useWelcomeCoupon";
import { FILTER_MODAL, FilterModal } from "@/features/products/components/FilterModal";

export default function GlobalModals(){
    const {modal,closeModal} = useModalStore()
    return (
        <>
            <ReuseableModal isOpen={modal === 'signup'} onClose={closeModal}>
                <SignupForm/>
            </ReuseableModal>

            <ReuseableModal isOpen={modal === 'login'} onClose={closeModal}>
                <LoginForm/>
            </ReuseableModal>

            <ReuseableModal isOpen={modal === 'review'} onClose={closeModal} size="lg">
                <ReviewForm/>
            </ReuseableModal>

            <ReuseableModal isOpen={modal === WELCOME_COUPON_MODAL} onClose={closeModal} size="md">
                <WelcomeCoupons/>
            </ReuseableModal>

            <ReuseableModal isOpen={modal === FILTER_MODAL} onClose={closeModal} size="lg">
                <FilterModal/>
            </ReuseableModal>
        </>
    )
}