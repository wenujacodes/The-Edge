"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FoodCard } from "@/components/shop/FoodCard";
import { ShopCard } from "@/components/shop/ShopCard";
import { mockCategories } from "@/lib/mockData";
import { dietaryFilters } from "@/lib/designSystem";
import { useMenuItems, useShops } from "@/lib/supabase/hooks";

export default function BrowsePage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeDiet, setActiveDiet] = useState<string | null>(null);
  const [activeShop, setActiveShop] = useState<string | null>(null);
  const [view, setView] = useState<"food" | "shops">("food");
  const { data: shops = [] } = useShops();
  const { data: items = [] } = useMenuItems();
  const shopNames = useMemo(
    () => new Map(shops.map((shop) => [shop.id, shop.name])),
    [shops]
  );

  const filtered = items.filter((i) => {
    const matchQ = query
      ? i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.description.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchC = activeCat ? i.category === activeCat : true;
    const matchD = activeDiet ? i.dietaryTags.includes(activeDiet) : true;
    const matchS = activeShop ? i.shopId === activeShop : true;
    return matchQ && matchC && matchD && matchS;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="label-mono mb-2">● Browse</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Menu</h1>
          <p className="text-muted-foreground">Discover the best food on campus.</p>
        </div>

        {/* View toggle */}
        <div className="inline-flex rounded-full bg-secondary p-1 text-sm font-medium mb-6">
          <button
            id="view-food"
            onClick={() => setView("food")}
            className={`pill px-5 py-2 transition-smooth ${view === "food" ? "bg-background shadow-soft" : "text-muted-foreground"}`}
          >
            Food items
          </button>
          <button
            id="view-shops"
            onClick={() => setView("shops")}
            className={`pill px-5 py-2 transition-smooth ${view === "shops" ? "bg-background shadow-soft" : "text-muted-foreground"}`}
          >
            Shops
          </button>
        </div>

        {view === "food" ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar filters */}
            <aside className="w-full md:w-64 shrink-0 space-y-8">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="browse-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search food or shop…"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-secondary border border-transparent focus:border-primary focus:bg-background transition-smooth outline-none text-sm focus-dashed"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="label-mono mb-4">Categories</h3>
                <div className="flex flex-col gap-1">
                  {mockCategories.map((c) => (
                    <button
                      key={c.id}
                      id={`browse-cat-${c.id}`}
                      onClick={() => setActiveCat(activeCat === c.label ? null : c.label)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-smooth focus-dashed ${
                        activeCat === c.label
                          ? "bg-foreground text-background"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      <span>{c.emoji}</span>
                      <span className="font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shops filter */}
              <div>
                <h3 className="label-mono mb-4">Shop</h3>
                <div className="flex flex-col gap-1">
                  {shops.map((s) => (
                    <button
                      key={s.id}
                      id={`browse-shop-${s.id}`}
                      onClick={() => setActiveShop(activeShop === s.id ? null : s.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-smooth focus-dashed ${
                        activeShop === s.id
                          ? "bg-foreground text-background"
                          : "hover:bg-secondary text-foreground"
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span className="font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary filters */}
              <div>
                <h3 className="label-mono mb-4">Dietary</h3>
                <div className="flex flex-wrap gap-2">
                  {dietaryFilters.map((d) => (
                    <button
                      key={d}
                      id={`browse-diet-${d.toLowerCase()}`}
                      onClick={() => setActiveDiet(activeDiet === d ? null : d)}
                      className={`pill px-3 py-1.5 text-[11px] font-medium transition-smooth focus-dashed ${
                        activeDiet === d
                          ? "bg-success text-success-foreground"
                          : "bg-secondary hover:bg-accent"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {(query || activeCat || activeDiet || activeShop) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveCat(null);
                    setActiveDiet(null);
                    setActiveShop(null);
                  }}
                  className="w-full pill border border-border py-2 text-sm text-muted-foreground hover:bg-secondary transition-smooth focus-dashed"
                >
                  Clear all filters
                </button>
              )}
            </aside>

            {/* Food grid */}
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-4">
                {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((i) => (
                  <FoodCard key={i.id} item={i} shopName={shopNames.get(i.shopId)} />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground bg-secondary/30 rounded-[2rem] border border-dashed border-border">
                  No items found matching your filters.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Shop cards grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {shops.map((s) => (
              <div key={s.id} className="w-full">
                <ShopCard shop={s} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
