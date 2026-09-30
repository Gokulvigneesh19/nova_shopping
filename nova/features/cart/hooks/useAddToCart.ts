import { useQueryClient } from "@tanstack/react-query";
import { useCustomMutation } from "@/lib/hooks/useCustomeMutation";
import { AddToCartPayload, CartItem, CartResponse } from "../types/cart.type";
import { AddProduct, AddToCart, DeleteProduct } from "../services/cart.service";
import useCartStore from "@/lib/globalstore/cart.store";
import useProductStore from "@/lib/globalstore/product.store";
import { CART_QUERY_KEY } from "./useCart";

// Cart mutations return the affected item (add/update) or the removed product id (delete).
type CartMutationResult = { item?: CartItem; product_id?: string };

export function useAddToCart() {
    const { incrementCartCount } = useCartStore();
    const { editProduct } = useProductStore();

    return useCustomMutation((payload: AddToCartPayload) => AddToCart(payload) as Promise<CartMutationResult>, {
        mutationKey: ["addToCart"],
        // Refresh the bag and the products' `is_cart_added` flags.
        invalidateQueries: [CART_QUERY_KEY, ["products"]],
        successMessage: "Added to Cart Successfully",
        onSuccess: (data) => {
            incrementCartCount();
            if (data?.item?.product) editProduct(data.item.product, true);
        }
    });
}

export function useIncrementProduct() {
    const queryClient = useQueryClient();

    return useCustomMutation(({ payload, id }: { payload: AddToCartPayload; id: string }) => AddProduct(payload, id) as Promise<CartMutationResult>, {
        mutationKey: ["addproduct"],
        successMessage: "Product Added Successfully",
        onSuccess: (data) => {
            const updated = data?.item;
            if (!updated?.id) return;
            // Patch the quantity instantly, then refetch so the API's totals and discounts update too.
            queryClient.setQueryData<CartResponse>(CART_QUERY_KEY, (old) =>
                old && {
                    ...old,
                    cart: {
                        ...old.cart,
                        items: old.cart.items.map((item) =>
                            item.id === updated.id ? { ...item, quantity: updated.quantity } : item
                        ),
                    },
                }
            );
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        }
    });
}

// The cart query is refreshed by the caller (CartView) after its exit animation.
export function useDeleteProduct() {
    const { decrementCartCount } = useCartStore();
    const { editProduct } = useProductStore();

    return useCustomMutation(({ id }: { id: string }) => DeleteProduct(id) as Promise<CartMutationResult>, {
        mutationKey: ["deleteproduct"],
        invalidateQueries: [["products"]],
        successMessage: "Product Deleted Successfully",
        onSuccess: (data) => {
            decrementCartCount();
            if (data?.product_id) editProduct(data.product_id, false);
        }
    });
}
