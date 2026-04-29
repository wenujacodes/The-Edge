"use client";

import Image from "next/image";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { MenuItem, shopById } from "@/lib/mockData";
import { useCart } from "@/store/cart";

interface FoodCardProps {
  item: MenuItem;
  compact?: boolean;
  shopName?: string;
}

export const FoodCard = ({ item, compact = false, shopName }: FoodCardProps) => {
  const { add, toggleFav, favorites } = useCart();
  const fav = favorites.includes(item.id);
  const shop = shopById(item.shopId);

  return (
    <article className="group relative rounded-3xl bg-card border border-border overflow-hidden hover:shadow-elevated transition-smooth">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-smooth group-hover:scale-[1.04]"
        />

        {/* Fav button */}
        <button
          id={`fav-btn-${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            toggleFav(item.id);
            toast(fav ? "Removed from favorites" : "Added to favorites");
          }}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass-light grid place-items-center focus-dashed transition-smooth hover:scale-110"
        >
          <Heart
            className={`w-4 h-4 ${
              fav ? "fill-destructive text-destructive" : "text-white"
            }`}
          />
        </button>

        {/* Badges */}
        {item.badge && (
          <span className="absolute top-3 left-3 pill text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-foreground text-background">
            {item.badge}
          </span>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm grid place-items-center">
            <span className="pill bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold tracking-tight truncate">{item.title}</h3>
            {!compact && (shopName || shop) && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{shopName ?? shop?.name}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono font-semibold">Rs {item.price}</div>
            {item.discount && (
              <div className="text-[10px] text-success font-medium">
                -{item.discount}% off
              </div>
            )}
          </div>
        </div>

        {!compact && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 mt-4">
          <div className="flex flex-wrap gap-1.5">
            {item.dietaryTags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-full bg-accent text-accent-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <button
            id={`add-to-cart-${item.id}`}
            onClick={() => {
              if (!item.isAvailable) return;
              add(item);
              toast.success(`${item.title} added to cart`);
            }}
            disabled={!item.isAvailable}
            className="inline-flex items-center gap-1.5 pill bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary-glow transition-smooth focus-dashed disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>
    </article>
  );
};
