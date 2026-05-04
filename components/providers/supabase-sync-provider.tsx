"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useCart } from "@/store/cart";
import { 
  fetchServerCart, 
  fetchServerFavorites, 
  fetchAllMenuItems,
  upsertServerCartItem
} from "@/lib/supabase/data";
import { useQuery } from "@tanstack/react-query";

export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const { setUserId, setItems, setFavorites, items: localItems, favorites: localFavs, userId } = useCart();
  const isInitialSyncRef = useRef(false);

  // Fetch all menu items for mapping server IDs back to full objects
  const { data: allMenuItems } = useQuery({
    queryKey: ["all-menu-items"],
    queryFn: fetchAllMenuItems,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        setUserId(session.user.id);
        
        // Initial sync from server on login
        if (event === "SIGNED_IN" || (event === "INITIAL_SESSION" && !isInitialSyncRef.current)) {
          isInitialSyncRef.current = true;
          
          // Small delay to ensure session is fully propagated to all hooks
          await new Promise(resolve => setTimeout(resolve, 500));
          
          try {
            // Verify session is still valid
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
              console.warn("Sync skipped: No valid user verified", userError);
              return;
            }

            const [serverCart, serverFavs] = await Promise.all([
              fetchServerCart(user.id),
              fetchServerFavorites(user.id)
            ]);

            // Merge Favorites
            const mergedFavs = Array.from(new Set([...localFavs, ...serverFavs]));
            setFavorites(mergedFavs);

            // Merge Cart
            // Strategy: If local has items, push them to server. 
            // If local is empty, pull from server.
            if (localItems.length > 0) {
              // Push local to server
              for (const item of localItems) {
                await upsertServerCartItem(user.id, {
                  menu_item_id: item.item.id,
                  shop_id: item.item.shopId,
                  quantity: item.qty,
                  notes: item.notes,
                  dining: item.dining,
                  scheduled_slot: item.scheduledSlot
                });
              }
            } else if (serverCart.length > 0) {
              // Pull from server if menu items are ready
              const currentMenuItems = allMenuItems;
              if (currentMenuItems) {
                const mappedItems = serverCart.map(sc => {
                  const menuItem = currentMenuItems.find(mi => mi.id === sc.menu_item_id);
                  if (!menuItem) return null;
                  return {
                    item: menuItem,
                    qty: sc.quantity,
                    notes: sc.notes ?? undefined,
                    dining: sc.dining as "dine-in" | "takeaway",
                    scheduledSlot: sc.scheduled_slot
                  };
                }).filter(Boolean) as any[];
                
                setItems(mappedItems);
              }
            }
          } catch (error: any) {
            console.error("Sync error for user:", session.user.id);
            if (typeof error === 'string') {
              console.error("Error string:", error);
            } else if (error && typeof error === 'object') {
              console.dir(error); 
              console.error("Error details:", {
                message: error.message,
                code: error.code,
                status: error.status,
                name: error.name
              });
            } else {
              console.error("Unknown error type:", error);
            }
          }
        }
      } else {
        setUserId(null);
        isInitialSyncRef.current = false;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUserId, setItems, setFavorites, allMenuItems, localItems, localFavs]);

  // Listen for realtime cart updates from other tabs/devices
  useEffect(() => {
    if (!supabase || !userId) return;

    const channel = supabase
      .channel(`cart-sync:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_cart",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Re-fetch and update if something changed on server
          if (allMenuItems) {
            const serverCart = await fetchServerCart(userId);
            const mappedItems = serverCart.map(sc => {
              const menuItem = allMenuItems.find(mi => mi.id === sc.menu_item_id);
              if (!menuItem) return null;
              return {
                item: menuItem,
                qty: sc.quantity,
                notes: sc.notes ?? undefined,
                dining: sc.dining as "dine-in" | "takeaway",
                scheduledSlot: sc.scheduled_slot
              };
            }).filter(Boolean) as any[];
            
            // Only update if different to avoid loops
            // (Simple length check for now, can be more robust)
            if (mappedItems.length !== localItems.length) {
              setItems(mappedItems);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, setItems, allMenuItems, localItems.length]);

  return <>{children}</>;
}
