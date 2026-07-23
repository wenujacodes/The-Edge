"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { PWABanner } from "@/components/layout/PWABanner";
import { ShopCard } from "@/components/shop/ShopCard";
import { FoodCard } from "@/components/shop/FoodCard";
import { ShopFilterBar } from "@/components/shop/ShopFilterBar";
import { useMenuItems, useServerFavorites, useShops, useSupabaseUser, useProfile, useUserOrders } from "@/lib/supabase/hooks";
import { NotificationLink } from "@/components/layout/NotificationLink";
import { ShopCardSkeleton, FoodCardSkeleton } from "@/components/ui/Skeleton";
import type { Shop } from "@/lib/types";

const TIME_SECTIONS = [
  {
    maxHour: 11,
    title: "Breakfast picks",
    keywords: ["breakfast", "hopper", "roti", "bread", "toast", "egg", "porridge", "dosa", "milk", "tea", "coffee"],
  },
  {
    maxHour: 16,
    title: "Lunch rush favourites",
    keywords: ["lunch", "rice", "curry", "biryani", "kottu", "noodle", "meal", "fried rice"],
  },
  {
    maxHour: 24,
    title: "Snacks & drinks",
    keywords: ["snack", "drink", "beverage", "juice", "shake", "short eat", "patty", "roll", "cutlet", "sweet", "dessert", "bites"],
  },
];

function SectionDivider() {
  return (
    <div className="container mx-auto px-4">
      <div className="h-px bg-border/70" />
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const { data: items = [], isLoading: itemsLoading } = useMenuItems();
  const { data: user } = useSupabaseUser();
  const { data: favorites = [] } = useServerFavorites(user?.id);
  const { data: profile } = useProfile(user?.id);
  const { data: orders = [] } = useUserOrders(user?.id);
  const displayName =
    profile?.displayName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Guest";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";
    return "Good Evening,";
  }, []);

  const shopNames = useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop.name])),
    [shops]
  );

  const mostOrdered = useMemo(() => items.filter((i) => i.popular && i.isAvailable), [items]);
  const recentlyOrdered = useMemo(() => items.slice(0, 6), [items]);
  const [todaysShops, setTodaysShops] = useState<Shop[]>([]);


  const favouriteItems = useMemo(() => items.filter((i) => favorites.includes(i.id)), [items, favorites]);

  const hasFavorites = favouriteItems.length > 0;

  const timeSection = useMemo(() => {
    const hour = new Date().getHours();
    return TIME_SECTIONS.find((s) => hour < s.maxHour) ?? TIME_SECTIONS[TIME_SECTIONS.length - 1];
  }, []);

  const timeBasedItems = useMemo(() => {
    const pool = items.filter((i) => i.isAvailable);
    const matched = pool.filter((i) => {
      const haystack = `${i.category} ${i.title} ${(i.dietaryTags || []).join(" ")}`.toLowerCase();
      return timeSection.keywords.some((k) => haystack.includes(k));
    });
    return (matched.length >= 4 ? matched : pool).slice(0, 10);
  }, [items, timeSection]);

  const orderedShopIds = useMemo(() => new Set(orders.map((o) => o.shopId)), [orders]);

  const recommendedItems = useMemo(() => {
    if (orderedShopIds.size === 0) return [];
    const exclude = new Set([...favouriteItems, ...recentlyOrdered].map((i) => i.id));
    return items.filter((i) => i.isAvailable && orderedShopIds.has(i.shopId) && !exclude.has(i.id)).slice(0, 10);
  }, [items, orderedShopIds, favouriteItems, recentlyOrdered]);

  const hasRecommended = recommendedItems.length > 0;

  return (
    <div className="flex-1 bg-background">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-6 pb-2 md:pt-28 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="animate-fade-up">
            {/* Profile Greeting */}
            <div className="flex items-center justify-between mb-8 md:hidden">
              <div>
                <div className="text-[13px] text-muted-foreground font-medium">{greeting}</div>
                <div className="text-lg font-semibold leading-tight text-foreground">{displayName.split(' ')[0]}</div>
              </div>
              <NotificationLink className="w-7 h-7 hover:opacity-80" iconClassName="w-6 h-6" />
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] mb-6">
              Feeling hungry?<br />
              Order ahead. Skip the queue.
            </h1>

            {/* Vendors Section */}
            <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {shops.length > 0 ? shops.filter(s => s.isOpen).slice(0, 5).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm relative z-10"
                  >
                    {s.emoji || ["🍡", "🍛", "🥤", "🥟", "🍩"][idx % 5]}
                  </div>
                )) : ["🍡", "🍛", "🥤", "🥟", "🍩"].map((emoji, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background grid place-items-center text-sm relative z-10"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <span>
                <span className="font-semibold text-foreground">{shops.length > 0 ? shops.filter(s => s.isOpen).length : 5} vendors</span> serving today
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <section className="container mx-auto px-4 pb-4" id="search-section">
        {/* Temporarily hidden while the browse-into-home merge is in progress */}
        <div className="hidden relative max-w-3xl mx-auto">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="home-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                router.push(`/?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder="Search food, drinks, or shops…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full pl-12 pr-5 py-4 rounded-full bg-secondary border border-transparent focus:border-black dark:focus:border-white focus:bg-background transition-smooth focus-dashed text-sm placeholder:text-muted-foreground outline-none"
          />
        </div>
        {!shopsLoading && shops.length > 0 && (
          <div className="mt-4 max-w-3xl mx-auto">
            <ShopFilterBar shops={shops} onFilteredShopsChange={setTodaysShops} />
          </div>
        )}
      </section>

      {/* ── SHOPS ── */}
      <section id="shops" className="container mx-auto px-4 py-6">
        <div className="mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Today&apos;s shops</h2>
        </div>
        {!shopsLoading && shops.length > 0 && todaysShops.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm bg-secondary/30 rounded-3xl border border-dashed border-border">
            No shops match these filters.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 pt-2 pb-4 scroll-pl-4 scroll-pr-4">
            {shopsLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className={`w-[260px] shrink-0 ${idx === 0 ? 'ml-4' : ''}`}>
                  <ShopCardSkeleton />
                </div>
              ))
            ) : (
              todaysShops.map((s, index) => (
                <div key={s.id} className={`w-[260px] shrink-0 snap-start ${index === 0 ? 'ml-4' : ''} ${index === todaysShops.length - 1 ? 'mr-4' : ''}`}>
                  <ShopCard shop={s} />
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* ── POPULAR PICKS (loading skeleton, unconditional) ── */}
      {itemsLoading && (
        <>
          <SectionDivider />
          <section className="container mx-auto px-4 py-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Popular picks</h2>
            <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 pt-2 pb-4 scroll-pl-4 scroll-pr-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className={`w-[200px] md:w-[240px] shrink-0 ${idx === 0 ? 'ml-4' : ''}`}>
                  <FoodCardSkeleton />
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {[
        {
          key: "time",
          show: timeBasedItems.length > 0,
          title: timeSection.title,
          list: timeBasedItems,
        },
        {
          key: "favourites",
          show: hasFavorites,
          title: "Your favourites",
          list: favouriteItems,
        },
        {
          key: "recommended",
          show: hasRecommended,
          title: "Recommended for you",
          list: recommendedItems,
        },
        {
          key: "most-ordered",
          show: mostOrdered.length > 0,
          title: "Most ordered today",
          list: mostOrdered,
        },
        {
          key: "recently-ordered",
          show: recentlyOrdered.length > 0,
          title: "Recently ordered",
          list: recentlyOrdered,
        },
      ]
        .filter((section) => section.show)
        .map((section) => (
          <div key={section.key}>
            <SectionDivider />
            <section className="container mx-auto px-4 py-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{section.title}</h2>
              <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 pt-2 pb-4 scroll-pl-4 scroll-pr-4">
                {section.list.map((item, index) => (
                  <div key={item.id} className={`w-[200px] md:w-[240px] shrink-0 snap-start ${index === 0 ? 'ml-4' : ''} ${index === section.list.length - 1 ? 'mr-4' : ''}`}>
                    <FoodCard item={item} shopName={shopNames.get(item.shopId)} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        ))}

      <div className="pb-10" />
      <PWABanner />
    </div>
  );
}
