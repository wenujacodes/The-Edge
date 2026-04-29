import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/lib/mockData";

// TODO: Replace with Supabase cart persistence for logged-in users

export type CartEntry = {
  item: MenuItem;
  qty: number;
  notes?: string;
  dining: "dine-in" | "takeaway";
};

type CartState = {
  items: CartEntry[];
  favorites: string[];
  recentlyViewed: string[];
  add: (
    item: MenuItem,
    qty?: number,
    opts?: { notes?: string; dining?: "dine-in" | "takeaway" }
  ) => void;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setNotes: (itemId: string, notes: string) => void;
  setDining: (itemId: string, dining: "dine-in" | "takeaway") => void;
  clear: () => void;
  toggleFav: (itemId: string) => void;
  addRecentlyViewed: (shopId: string) => void;
  count: () => number;
  total: () => number;
  groupedByShop: () => Map<string, CartEntry[]>;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      favorites: [],
      recentlyViewed: [],

      add: (item, qty = 1, opts) =>
        set((s) => {
          const existing = s.items.find((c) => c.item.id === item.id);
          if (existing) {
            return {
              items: s.items.map((c) =>
                c.item.id === item.id
                  ? { ...c, qty: c.qty + qty, ...(opts ?? {}) }
                  : c
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                item,
                qty,
                notes: opts?.notes,
                dining: opts?.dining ?? "takeaway",
              },
            ],
          };
        }),

      remove: (id) =>
        set((s) => ({ items: s.items.filter((c) => c.item.id !== id) })),

      setQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((c) => c.item.id !== id)
              : s.items.map((c) => (c.item.id === id ? { ...c, qty } : c)),
        })),

      setNotes: (id, notes) =>
        set((s) => ({
          items: s.items.map((c) => (c.item.id === id ? { ...c, notes } : c)),
        })),

      setDining: (id, dining) =>
        set((s) => ({
          items: s.items.map((c) => (c.item.id === id ? { ...c, dining } : c)),
        })),

      clear: () => set({ items: [] }),

      toggleFav: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),

      addRecentlyViewed: (shopId) =>
        set((s) => {
          const filtered = s.recentlyViewed.filter((id) => id !== shopId);
          return { recentlyViewed: [shopId, ...filtered].slice(0, 5) };
        }),

      count: () => get().items.reduce((n, c) => n + c.qty, 0),

      total: () =>
        get().items.reduce((n, c) => n + c.qty * c.item.price, 0),

      groupedByShop: () => {
        const map = new Map<string, CartEntry[]>();
        get().items.forEach((c) => {
          const arr = map.get(c.item.shopId) ?? [];
          arr.push(c);
          map.set(c.item.shopId, arr);
        });
        return map;
      },
    }),
    { name: "edge-cart-v2" }
  )
);
