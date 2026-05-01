"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { PWABanner } from "@/components/layout/PWABanner";
import { ShopCard } from "@/components/shop/ShopCard";
import { FoodCard } from "@/components/shop/FoodCard";
import { useMenuItems, useShops } from "@/lib/supabase/hooks";
import { useCart } from "@/store/cart";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data: shops = [] } = useShops();
  const { data: items = [] } = useMenuItems();
  const { favorites } = useCart();

  const shopNames = useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop.name])),
    [shops]
  );

  const mostOrdered = useMemo(() => items.filter((i) => i.popular && i.isAvailable), [items]);
  const recentlyOrdered = useMemo(() => items.slice(0, 6), [items]); // Mocking recently ordered for now
  const favouriteItems = useMemo(() => items.filter((i) => favorites.includes(i.id)), [items, favorites]);

  const hasFavorites = favouriteItems.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-10 pb-12 md:pt-16 md:pb-20">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
            <div className="animate-fade-up">
              <div className="label-mono mb-5">Campus food, sorted</div>
              <h1 className="text-[44px] sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
                Order ahead.<br />
                Skip the queue.<br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[hsl(190_95%_55%)] to-success">
                  Pick up when ready.
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                One tap for fried rice, mango juice or a quick samosa. Pay online and grab it from the vendor with your pickup code — no waiting.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/browse"
                  id="hero-cta-browse"
                  className="inline-flex items-center gap-2 pill bg-foreground text-background px-6 py-3.5 font-medium hover:bg-foreground/90 transition-smooth focus-dashed shadow-pop"
                >
                  Start Ordering <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {shops.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className="w-7 h-7 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm"
                    >
                      {s.emoji}
                    </div>
                  ))}
                </div>
                <span>
                  <span className="font-semibold text-foreground">{shops.length} vendors</span> serving the campus today
                </span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-up hidden lg:block">
              <div className="aspect-square rounded-[2rem] hero-gradient p-3 shadow-pop">
                <div className="w-full h-full rounded-[1.6rem] bg-white/10 backdrop-blur-sm grid place-items-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🍛</div>
                    <div className="text-white font-bold text-2xl">Campus Canteen</div>
                    <div className="text-white/70 text-sm mt-1">Order • Pay • Pick up</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="container mx-auto px-4 pb-4" id="search-section">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder="Search food, drinks, or shops…"
            className="w-full pl-12 pr-5 py-4 rounded-full bg-secondary border border-transparent focus:border-primary focus:bg-background transition-smooth focus-dashed text-sm placeholder:text-muted-foreground outline-none"
          />
        </div>
      </section>

      {/* ── SHOPS ── */}
      <section id="shops" className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Today&apos;s shops</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-2">
          {shops.map((s) => (
            <div key={s.id} className="w-[260px] shrink-0 snap-start">
              <ShopCard shop={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FAVOURITES (Conditional) ── */}
      {hasFavorites && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your favourites</h2>
            </div>
            <Link
              href="/favorites"
              className="pill bg-secondary text-muted-foreground text-xs font-medium px-4 py-1.5 hover:bg-secondary/80 transition-smooth focus-dashed"
            >
              View all
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-2">
            {favouriteItems.map((i) => (
              <div key={i.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                <FoodCard item={i} shopName={shopNames.get(i.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MOST ORDERED ── */}
      {mostOrdered.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Most ordered today</h2>
          
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-2">
            {mostOrdered.map((i) => (
              <div key={i.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                <FoodCard item={i} shopName={shopNames.get(i.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENTLY ORDERED ── */}
      {recentlyOrdered.length > 0 && (
        <section className="container mx-auto px-4 py-8 mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Recently ordered</h2>
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide pb-2">
            {recentlyOrdered.map((i) => (
              <div key={i.id} className="w-[200px] md:w-[240px] shrink-0 snap-start">
                <FoodCard item={i} shopName={shopNames.get(i.shopId)} />
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <PWABanner />
    </div>
  );
}
