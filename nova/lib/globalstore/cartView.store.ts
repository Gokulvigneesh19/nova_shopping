import { create } from "zustand";

interface CartStore {
  cartView: any[];
  setCartView: (cartView: any[]) => void;
  setQuantity: (id: string, quantity: number) => void;
  reset: () => void;
}

const initialState = {
  cartView: [],
};
const useCartViewStore = create<CartStore>((set) => ({
  ...initialState,
  setCartView: (cartView) => set({ cartView }),
  setQuantity: (id: string, quantity: number) => set((state) => ({
    cartView: state.cartView.map(item => item.id === id ? { ...item, quantity } : item)
  })),
  reset: () => set({ ...initialState }),
}));

export default useCartViewStore;