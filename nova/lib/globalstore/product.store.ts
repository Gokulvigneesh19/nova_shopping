import { create } from "zustand";

interface ProductStore {
  products: any[];
  setProducts: (products: any[]) => void;
  editProduct: (productId: string, is_cart_added: boolean) => void;
}
const useProductStore = create<ProductStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  editProduct: (productId: string,is_cart_added: boolean) =>
    set((state) => {
      const index = state.products.findIndex((p) => p.id === productId);
      if (index === -1) return state;

      const products = [...state.products];
      products[index] = { ...products[index], is_cart_added };
      return { products };
    }),
}));

export default useProductStore;