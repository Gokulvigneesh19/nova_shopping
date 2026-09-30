import useAuthStore from "../globalstore/auth.store";
import useCartStore from "../globalstore/cart.store";
import useCartViewStore from "../globalstore/cartView.store";
import useProductStore from "../globalstore/product.store";

export const resetAllStores = () => {
  useAuthStore.getState().reset();
  useCartStore.getState().reset();
  useCartViewStore.getState().reset();
};