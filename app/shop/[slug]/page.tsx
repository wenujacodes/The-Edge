"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Star, AlertCircle } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { FoodCard } from "@/components/shop/FoodCard";
import { useCart } from "@/store/cart";
import { useShop, useShopMenuItems } from "@/lib/supabase/hooks";

export default function ShopPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: shop, isLoading } = useShop(slug ?? "");
  const { data: items = [] } = useShopMenuItems(shop?.id);
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const [activeCat, setActiveCat] = useState<string>("");
  const { addRecentlyViewed } = useCart();

  // Track recently viewed
  useEffect(() => {
    if (shop) addRecentlyViewed(shop.id);
  }, [addRecentlyViewed, shop]);

  // Set first category on load
  useEffect(() => {
    if (cats.length > 0 && !activeCat) setActiveCat(cats[0]);
  }, [activeCat, cats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading shop...
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold">Shop not found</h1>
          <p className="text-muted-foreground mt-2">
            This shop doesn&apos;t exist or may have moved.
          </p>
          <Link href="/" className="text-primary mt-4 inline-block hover:underline">
            ← Back home
          </Link>
        </div>
      </div>
    );
  }

  const visible = activeCat ? items.filter((i) => i.category === activeCat) : items;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-dashed transition-smooth"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Shop header */}
        <div className="mt-6 flex items-start gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-secondary grid place-items-center text-5xl shrink-0 shadow-soft">
            {shop.emoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{shop.name}</h1>
              <span
                className={`pill text-[11px] font-semibold px-2.5 py-1 ${
                  shop.isOpen
                    ? "bg-success-soft text-success-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {shop.isOpen ? "● OPEN" : "● CLOSED"}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{shop.tagline}</p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
              {shop.description}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {shop.prepTime} avg
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-warning text-warning" /> {shop.rating}
              </span>
              <span>{shop.reviewCount} reviews</span>
            </div>
            {shop.closedNote && (
              <div className="mt-4 rounded-2xl bg-accent text-accent-foreground px-4 py-3 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {shop.closedNote}
              </div>
            )}
          </div>
        </div>

        {/* Sticky category tabs */}
        {cats.length > 1 && (
          <div className="sticky top-16 bg-background/90 backdrop-blur-xl z-20 -mx-4 px-4 py-4 mt-8 border-b border-border">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {cats.map((c) => (
                <button
                  key={c}
                  id={`shop-cat-${c.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setActiveCat(c)}
                  className={`pill px-4 py-2 text-sm font-medium whitespace-nowrap transition-smooth focus-dashed ${
                    activeCat === c
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground hover:bg-accent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu grid */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((i) => (
            <FoodCard key={i.id} item={i} compact />
          ))}
        </div>

        {visible.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No items in this category.
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
