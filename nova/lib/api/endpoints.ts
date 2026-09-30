export const API = {
    auth: {
        login: "/login/",
        register: "/signup/",
    },
    users:{
        profile: "/profile/",
        products: "/products/",
        cart: "/cart/",
        cartCoupon: "/cart/coupon/",
        cartCount: "/cart/count/",
        customers: "/users/",
        categories: "/categories/",
        reviews: "/reviews/",
        addresses: "/addresses/",
        orders: "/orders/",
        ordersCheckout: "/orders/checkout/",
        verifyPayment: "/orders/verify-payment/",
        paymentFailed: "/orders/payment-failed/",
        
    },
    admin:{
        dashboard: "/admin/dashboard/",
        orders: "/admin/orders/",
        order: (id: string) => `/admin/orders/${id}/`,
        coupons: "/coupons/",
        coupon: (id: string) => `/coupons/${id}/`,
    }
}
