"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { Check, Heart, Leaf, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { MenuItem } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useServerFavorites, useShopById, useSupabaseUser, useToggleFavorite } from "@/lib/supabase/hooks";
import { AddToCartModal } from "@/components/shop/AddToCartModal";

interface FoodCardProps {
  item: MenuItem;
  compact?: boolean;
  shopName?: string;
}

export const FoodCard = ({ item, compact = false, shopName }: FoodCardProps) => {
  const { add, items, remove } = useCart();
  const { data: user } = useSupabaseUser();
  const userId = user?.id;
  const { data: favorites = [] } = useServerFavorites(userId);
  const toggleFavorite = useToggleFavorite();
  const serverFav = favorites.includes(item.id);
  const [optimisticFav, setOptimisticFav] = useState<boolean | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const fav = optimisticFav ?? serverFav;
  const { data: shop } = useShopById(item.shopId);
  const isInCart = items.some((cartItem) => cartItem.item.id === item.id);
  const specialDietaryTag = item.dietaryTags.find((tag) =>
    ["vegan", "vegetarian"].includes(tag.toLowerCase())
  );
  const heartControls = useAnimation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    setOptimisticFav(null);
  }, [serverFav]);

  // Pop the heart on every toggle without ever remounting it — remounting the
  // element caused a one-frame flash of the wrong color before the fill class
  // finished applying.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    heartControls.start({
      scale: [0.7, 1.15, 1],
      transition: { duration: 0.3, ease: "easeOut" },
    });
  }, [fav, heartControls]);

  const handleFavorite = () => {
    if (!userId) {
      toast.error("Please sign in to save favorites");
      return;
    }

    const nextFav = !fav;
    setOptimisticFav(nextFav);
    toggleFavorite.mutate(
      { userId, menuItemId: item.id, isFavorite: fav },
      {
        onError: () => {
          setOptimisticFav(null);
          toast.error("Could not update favorites");
        },
      }
    );
  };

  return (
    <article className="group relative cursor-default">
      {/* Image */}
      <div className="relative aspect-[2/1] rounded-2xl overflow-hidden bg-muted">
        <Image
          src={item.image}
          alt={item.title}
          fill
          draggable={false}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-background/80 grid place-items-center">
            <span className="pill bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content — no card/border/background, sits directly on the page */}
      <div className="pt-3">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 flex items-center gap-1 font-bold text-sm tracking-tight leading-tight">
            {specialDietaryTag && (
              <Leaf
                className="w-3 h-3 text-emerald-500 shrink-0"
                aria-label={specialDietaryTag}
              />
            )}
            <span className="truncate">{item.title}</span>
          </h3>
          <motion.button
            id={`fav-btn-${item.id}`}
            onClick={handleFavorite}
            disabled={toggleFavorite.isPending}
            whileTap={{ scale: 0.8 }}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            className="w-8 h-8 -mt-1 -mr-1 rounded-full grid place-items-center focus-dashed transition-smooth hover:bg-secondary disabled:opacity-60 shrink-0"
          >
            <motion.span animate={heartControls} className="block">
              <Heart
                className={`w-5 h-5 ${
                  fav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
              />
            </motion.span>
          </motion.button>
        </div>

        {(shopName || shop) && (
          <p className="text-[11px] font-bold text-muted-foreground truncate -mt-0.5">{shopName ?? shop?.name}</p>
        )}

        {shop && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <Star className="w-3 h-3 fill-foreground text-foreground shrink-0" />
            <span className="font-bold text-foreground">{shop.rating.toFixed(1)}</span>
            <span className="shrink-0">({shop.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2.5 mt-2">
          <div className="font-bold text-base tracking-tight leading-none">
            Rs {item.price.toFixed(0)}
          </div>

          <button
            id={`add-to-cart-${item.id}`}
            onClick={() => {
              if (!item.isAvailable) return;
              if (isInCart) {
                remove(item.id);
                toast.error(`${item.title} removed from cart`);
                return;
              }
              setShowAddModal(true);
            }}
            disabled={!item.isAvailable}
            className={`w-8 h-8 rounded-full text-white grid place-items-center transition-colors focus-dashed disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shrink-0 ${
              isInCart ? "bg-[#3AD07A] dark:bg-[#2DAA63]" : "bg-foreground hover:bg-foreground/90 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            }`}
          >
            {isInCart ? (
              <Check className="w-5 h-5 stroke-[3px]" />
            ) : (
              <Plus className="w-5 h-5 stroke-[3px]" />
            )}
          </button>
        </div>
      </div>

      <AddToCartModal
        item={item}
        shopName={shopName ?? shop?.name}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={(qty, opts) => {
          add(item, qty, opts);
          setShowAddModal(false);
          toast.success(`${qty} ${item.title} added to cart`);
        }}
      />
    </article>
  );
};
