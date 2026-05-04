import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem } from "@/lib/mockData";
import { 
  upsertServerCartItem, 
  removeServerCartItem, 
  clearServerCart, 
  addServerFavorite, 
  removeServerFavorite,
  clearServerCartForShop
} from "@/lib/supabase/data";

export type CartEntry = {
  item: MenuItem;
  qty: number;
  notes?: string;
  dining: "dine-in" | "takeaway";
  scheduledSlot: string; // "ASAP" or a specific time slot
};

type CartState = {
  items: CartEntry[];
  favorites: string[];
  recentlyViewed: string[];
  userId: string | null;
  
  // Set userId for sync logic
  setUserId: (id: string | null) => void;
  
  // Cart Actions
  add: (
    item: MenuItem,
    qty?: number,
    opts?: { notes?: string; dining?: "dine-in" | "takeaway"; scheduledSlot?: string }
  ) => void;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setNotes: (itemId: string, notes: string) => void;
  setDining: (itemId: string, dining: "dine-in" | "takeaway") => void;
  setScheduledSlot: (itemId: string, slot: string) => void;
  clear: () => void;
  clearShop: (shopId: string) => void;
  
  // Bulk Actions (for sync)
  setItems: (items: CartEntry[]) => void;
  setFavorites: (favs: string[]) => void;

  // Favorites Actions
  toggleFav: (itemId: string) => void;
  
  // Navigation History
  addRecentlyViewed: (shopId: string) => void;
  
  // Selectors
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
      userId: null,

      setUserId: (id) => set({ userId: id }),

      add: (item, qty = 1, opts) => {
        const state = get();
        const existing = state.items.find((c) => c.item.id === item.id);
        
        let newItems: CartEntry[];
        if (existing) {
          newItems = state.items.map((c) =>
            c.item.id === item.id
              ? { 
                  ...c, 
                  qty: c.qty + qty, 
                  notes: opts?.notes ?? c.notes,
                  dining: opts?.dining ?? c.dining,
                  scheduledSlot: opts?.scheduledSlot ?? c.scheduledSlot
                }
              : c
          );
        } else {
          newItems = [
            ...state.items,
            {
              item,
              qty,
              notes: opts?.notes,
              dining: opts?.dining ?? "takeaway",
              scheduledSlot: opts?.scheduledSlot ?? "ASAP",
            },
          ];
        }
        
        set({ items: newItems });
        
        // Sync with Supabase if logged in
        if (state.userId) {
          const updated = newItems.find(i => i.item.id === item.id)!;
          upsertServerCartItem(state.userId, {
            menu_item_id: item.id,
            shop_id: item.shopId,
            quantity: updated.qty,
            notes: updated.notes,
            dining: updated.dining,
            scheduled_slot: updated.scheduledSlot
          }).catch(console.error);
        }
      },

      remove: (id) => {
        const state = get();
        set({ items: state.items.filter((c) => c.item.id !== id) });
        
        if (state.userId) {
          removeServerCartItem(state.userId, id).catch(console.error);
        }
      },

      setQty: (id, qty) => {
        const state = get();
        const newItems = qty <= 0
          ? state.items.filter((c) => c.item.id !== id)
          : state.items.map((c) => (c.item.id === id ? { ...c, qty } : c));
        
        set({ items: newItems });
        
        if (state.userId) {
          if (qty <= 0) {
            removeServerCartItem(state.userId, id).catch(console.error);
          } else {
            const item = newItems.find(i => i.item.id === id)!;
            upsertServerCartItem(state.userId, {
              menu_item_id: id,
              shop_id: item.item.shopId,
              quantity: qty,
              notes: item.notes,
              dining: item.dining,
              scheduled_slot: item.scheduledSlot
            }).catch(console.error);
          }
        }
      },

      setNotes: (id, notes) => {
        const state = get();
        const newItems = state.items.map((c) => (c.item.id === id ? { ...c, notes } : c));
        set({ items: newItems });
        
        if (state.userId) {
          const item = newItems.find(i => i.item.id === id)!;
          upsertServerCartItem(state.userId, {
            menu_item_id: id,
            shop_id: item.item.shopId,
            quantity: item.qty,
            notes,
            dining: item.dining,
            scheduled_slot: item.scheduledSlot
          }).catch(console.error);
        }
      },

      setDining: (id, dining) => {
        const state = get();
        const newItems = state.items.map((c) => (c.item.id === id ? { ...c, dining } : c));
        set({ items: newItems });
        
        if (state.userId) {
          const item = newItems.find(i => i.item.id === id)!;
          upsertServerCartItem(state.userId, {
            menu_item_id: id,
            shop_id: item.item.shopId,
            quantity: item.qty,
            notes: item.notes,
            dining,
            scheduled_slot: item.scheduledSlot
          }).catch(console.error);
        }
      },

      setScheduledSlot: (id, slot) => {
        const state = get();
        const newItems = state.items.map((c) => (c.item.id === id ? { ...c, scheduledSlot: slot } : c));
        set({ items: newItems });
        
        if (state.userId) {
          const item = newItems.find(i => i.item.id === id)!;
          upsertServerCartItem(state.userId, {
            menu_item_id: id,
            shop_id: item.item.shopId,
            quantity: item.qty,
            notes: item.notes,
            dining: item.dining,
            scheduled_slot: slot
          }).catch(console.error);
        }
      },

      clear: () => {
        const state = get();
        set({ items: [] });
        if (state.userId) {
          clearServerCart(state.userId).catch(console.error);
        }
      },

      clearShop: (shopId) => {
        const state = get();
        set({ items: state.items.filter(i => i.item.shopId !== shopId) });
        if (state.userId) {
          clearServerCartForShop(state.userId, shopId).catch(console.error);
        }
      },

      setItems: (items) => set({ items }),
      setFavorites: (favorites) => set({ favorites }),

      toggleFav: (id) => {
        const state = get();
        const isFav = state.favorites.includes(id);
        const newFavs = isFav
          ? state.favorites.filter((f) => f !== id)
          : [...state.favorites, id];
        
        set({ favorites: newFavs });
        
        if (state.userId) {
          if (isFav) {
            removeServerFavorite(state.userId, id).catch(console.error);
          } else {
            addServerFavorite(state.userId, id).catch(console.error);
          }
        }
      },

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
    { name: "edge-cart-v3" } // Bumped version for schema change
  )
);
