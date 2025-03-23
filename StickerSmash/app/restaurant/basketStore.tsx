import { create } from "zustand";

// Define the basket state
interface BasketState {
  basket: { id: string; name: string; price: string }[];
  addToBasket: (item: { id: string; name: string; price: string }) => void;
  removeFromBasket: (id: string) => void;
  clearBasket: () => void;
}

// Create the store
export const useBasketStore = create<BasketState>((set) => ({
  basket: [],
  addToBasket: (item) =>
    set((state) => ({ basket: [...state.basket, item] })),
  removeFromBasket: (id) =>
    set((state) => ({
      basket: state.basket.filter((item) => item.id !== id),
    })),
  clearBasket: () => set({ basket: [] }),
}));
