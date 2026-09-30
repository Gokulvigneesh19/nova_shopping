import { create } from "zustand";

interface CartStore {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCartCount: (count?: number) => void;
  decrementCartCount: (count?: number) => void;
  clearCart: () => void;
  reset: () => void;
}

const initialState = {
  cartCount: 0,
};
const useCartStore = create<CartStore>((set) => ({
  ...initialState,

  setCartCount: (count) =>
    set({
      cartCount: count,
    }),

  incrementCartCount: (count = 1) =>
    set((state) => ({
      cartCount: state.cartCount + count,
    })),

  decrementCartCount: (count = 1) =>
    set((state) => ({
      cartCount: Math.max(0, state.cartCount - count),
    })),

  clearCart: () =>
    set({
      cartCount: 0,
    }),

  reset: () => set({ ...initialState }),
}));

export default useCartStore;