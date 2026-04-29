"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ListOrdered, Utensils, BarChart3, Settings,
  Check, ChefHat, Bell, TrendingUp, DollarSign,
  Plus, Pencil, Power, Users,
  ArrowLeft, ToggleLeft, ToggleRight, Upload,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { shopBySlug, itemsByShop, mockOrders, mockAnalytics } from "@/lib/mockData";
import { toast } from "sonner";
import { useUpdateOrderStatus, useVendorOrders } from "@/lib/supabase/hooks";
import { uploadPublicImage } from "@/lib/supabase/storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Tab = "orders" | "menu" | "analytics" | "settings";
type OrderStatus = "new" | "preparing" | "ready" | "completed";

const COLORS = ["hsl(211 100% 59%)", "hsl(134 81% 65%)", "hsl(38 100% 60%)", "hsl(190 95% 60%)"];

export default function VendorDashboard() {
  const params = useParams();
  const slug = params?.slug as string;
  const shop = shopBySlug(slug ?? "");
  const menuItems = shop ? itemsByShop(shop.id) : [];
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState(mockOrders);
  const [shopOpen, setShopOpen] = useState(shop?.isOpen ?? true);
  const [revenueFilter, setRevenueFilter] = useState<"today" | "week" | "month">("today");
  const { data: liveOrders = [] } = useVendorOrders(shop?.id);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  useEffect(() => {
    if (liveOrders.length > 0) setOrders(liveOrders);
  }, [liveOrders]);

  if (!shop) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold">Vendor not found</h1>
          <Link href="/" className="text-primary mt-4 inline-block hover:underline">← Back home</Link>
        </div>
      </div>
    );
  }

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    updateOrderStatusMutation.mutate({ orderId, status });
    toast.success(`Order ${orderId.split("-")[1]} marked as ${status}`);
  };

  const updateShopAsset = async (file: File, field: "logo_url" | "banner_url") => {
    const supabase = getSupabaseBrowserClient();
    const url = await uploadPublicImage({
      bucket: "shop-assets",
      file,
      path: `${shop.id}/${field}-${Date.now()}-${file.name}`,
    });

    if (supabase) {
      const { error } = await supabase.from("shops").update({ [field]: url }).eq("id", shop.id);
      if (error) throw error;
    }

    toast.success(field === "logo_url" ? "Shop logo uploaded" : "Shop banner uploaded");
  };

  const updateMenuItemImage = async (itemId: string, file: File) => {
    const supabase = getSupabaseBrowserClient();
    const url = await uploadPublicImage({
      bucket: "menu-images",
      file,
      path: `${shop.id}/${itemId}-${Date.now()}-${file.name}`,
    });

    if (supabase) {
      const { error } = await supabase.from("menu_items").update({ image_url: url }).eq("id", itemId);
      if (error) throw error;
    }

    toast.success("Menu item image uploaded");
  };

  const kanbanCols = [
    { key: "new" as const, label: "New", icon: Check, accent: "warning" },
    { key: "preparing" as const, label: "Preparing", icon: ChefHat, accent: "primary" },
    { key: "ready" as const, label: "Ready", icon: Bell, accent: "success" },
  ];

  const revenue =
    revenueFilter === "today"
      ? mockAnalytics.todayRevenue
      : revenueFilter === "week"
      ? mockAnalytics.weekRevenue
      : mockAnalytics.monthRevenue;

  const navItems = [
    { id: "orders" as Tab, label: "Live Orders", icon: ListOrdered },
    { id: "menu" as Tab, label: "Menu", icon: Utensils },
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "settings" as Tab, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-background sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl hero-gradient grid place-items-center text-white font-bold text-sm">E</div>
            <span className="font-bold tracking-tight">THE EDGE</span>
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary grid place-items-center text-xl">{shop.emoji}</div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{shop.name}</div>
              <div className={`text-[11px] flex items-center gap-1 ${shopOpen ? "text-success-foreground" : "text-muted-foreground"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${shopOpen ? "bg-success" : "bg-muted-foreground"}`} />
                {shopOpen ? "Live" : "Offline"}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1" aria-label="Vendor navigation">
          {navItems.map((t) => (
            <button
              key={t.id}
              id={`vendor-nav-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-smooth focus-dashed ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-smooth focus-dashed"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to storefront
          </Link>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="border-b border-border bg-background sticky top-0 z-10">
          <div className="px-6 lg:px-10 py-5 flex items-center justify-between">
            <div>
              <div className="label-mono mb-1">● Vendor dashboard</div>
              <h1 className="text-2xl font-bold tracking-tight">
                {tab === "orders" ? "Live orders" : tab === "menu" ? "Menu management" : tab === "analytics" ? "Analytics" : "Settings"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                id="shop-status-toggle"
                onClick={() => {
                  setShopOpen(!shopOpen);
                  toast.success(shopOpen ? "Shop closed" : "Shop opened");
                }}
                className={`pill px-4 py-2 text-sm font-medium focus-dashed transition-smooth flex items-center gap-2 ${
                  shopOpen ? "bg-success-soft text-success-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {shopOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {shopOpen ? "● Accepting orders" : "● Shop closed"}
              </button>
            </div>
          </div>
          {/* Mobile tab bar */}
          <div className="md:hidden flex gap-1 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {navItems.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pill px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-smooth ${
                  tab === t.id ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <div className="p-6 lg:p-10 flex-1">

          {/* ── ORDERS TAB ── */}
          {tab === "orders" && (
            <>
              {/* Stats */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Today's revenue" value={`Rs ${mockAnalytics.todayRevenue.toLocaleString()}`} delta="+18% vs yesterday" icon={DollarSign} accent="primary" />
                <StatCard label="Orders today" value={String(mockAnalytics.todayOrders)} delta={`+6 this hour`} icon={ListOrdered} accent="foreground" />
                <StatCard label="Peak hour" value={mockAnalytics.peakHour} delta={`${mockAnalytics.peakOrderCount} orders`} icon={TrendingUp} accent="success" />
                <StatCard label="Active now" value={String(orders.filter(o => o.status !== "completed").length)} delta="orders pending" icon={Users} accent="warning" />
              </div>

              {/* Kanban */}
              <div className="grid lg:grid-cols-3 gap-5">
                {kanbanCols.map((col) => {
                  const list = orders.filter((o) => o.status === col.key);
                  return (
                    <div key={col.key} className="rounded-3xl bg-background border border-border p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <col.icon className="w-4 h-4" />
                          <h3 className="font-semibold tracking-tight">{col.label}</h3>
                        </div>
                        <span className={`w-6 h-6 rounded-full grid place-items-center text-xs font-semibold ${
                          col.accent === "warning" ? "bg-warning/15 text-warning-foreground"
                            : col.accent === "primary" ? "bg-primary/10 text-primary"
                            : "bg-success-soft text-success-foreground"
                        }`}>
                          {list.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {list.map((o) => (
                          <div key={o.id} className="rounded-2xl border border-border p-4 hover:shadow-soft transition-smooth bg-card">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono font-bold tracking-widest text-sm">{o.code}</span>
                              <span className="text-[11px] text-muted-foreground">{o.time}</span>
                            </div>
                            <ul className="text-sm space-y-1 mb-2">
                              {o.items.map((it, idx) => <li key={idx}>{it}</li>)}
                            </ul>
                            {o.note && (
                              <div className="text-[11px] bg-warning/10 text-warning-foreground rounded-lg px-2 py-1 mb-2">
                                📝 {o.note}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-mono text-sm font-semibold">Rs {o.total}</span>
                              <div className="flex gap-1.5">
                                {col.key === "new" && (
                                  <button
                                    onClick={() => updateOrderStatus(o.id, "preparing")}
                                    className="pill bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 focus-dashed hover:bg-primary-glow transition-smooth"
                                  >
                                    Start preparing
                                  </button>
                                )}
                                {col.key === "preparing" && (
                                  <button
                                    onClick={() => updateOrderStatus(o.id, "ready")}
                                    className="pill bg-foreground text-background text-xs font-medium px-3 py-1.5 focus-dashed hover:bg-foreground/90 transition-smooth"
                                  >
                                    Mark ready
                                  </button>
                                )}
                                {col.key === "ready" && (
                                  <button
                                    onClick={() => updateOrderStatus(o.id, "completed")}
                                    className="pill bg-success text-success-foreground text-xs font-medium px-3 py-1.5 focus-dashed hover:opacity-90 transition-smooth"
                                  >
                                    Complete ✓
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {list.length === 0 && (
                          <div className="text-center py-10 text-xs text-muted-foreground">
                            No orders here
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── MENU TAB ── */}
          {tab === "menu" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">{menuItems.length} items on your menu</p>
                <button
                  id="add-menu-item-btn"
                  className="inline-flex items-center gap-2 pill bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-smooth focus-dashed"
                >
                  <Plus className="w-4 h-4" /> Add item
                  {/* TODO: Open modal with form — POST to Supabase menu_items table */}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {menuItems.map((i) => (
                  <div key={i.id} className="rounded-3xl border border-border bg-background overflow-hidden">
                    <div className="relative w-full aspect-[4/3]">
                      <Image src={i.image} alt={i.title} fill className="object-cover" />
                      {!i.isAvailable && (
                        <div className="absolute inset-0 bg-background/60 grid place-items-center">
                          <span className="pill bg-muted text-muted-foreground text-xs px-3 py-1.5">Unavailable</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{i.title}</h3>
                        <span className="font-mono font-semibold shrink-0">Rs {i.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{i.description}</p>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <button className="pill bg-secondary text-xs font-medium px-3 py-1.5 hover:bg-accent focus-dashed transition-smooth flex items-center gap-1">
                          <Pencil className="w-3 h-3" /> Edit
                          {/* TODO: Open edit modal — UPDATE menu_items in Supabase */}
                        </button>
                        <button className="pill border border-border text-xs font-medium px-3 py-1.5 hover:bg-secondary focus-dashed transition-smooth flex items-center gap-1">
                          <Power className="w-3 h-3" />
                          {i.isAvailable ? "Set unavailable" : "Set available"}
                          {/* TODO: PATCH isAvailable in Supabase */}
                        </button>
                        <label className="pill border border-border text-xs font-medium px-3 py-1.5 hover:bg-secondary focus-dashed transition-smooth flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3 h-3" /> Image
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              try {
                                await updateMenuItemImage(i.id, file);
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Image upload failed");
                              } finally {
                                event.target.value = "";
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="rounded-3xl border-2 border-dashed border-border p-10 grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition-smooth focus-dashed min-h-[200px]"
                >
                  <Plus className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Add new item</span>
                </button>
              </div>
            </>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === "analytics" && (
            <>
              {/* Revenue filter */}
              <div className="inline-flex rounded-full bg-secondary p-1 text-sm font-medium mb-6">
                {(["today", "week", "month"] as const).map((f) => (
                  <button
                    key={f}
                    id={`revenue-filter-${f}`}
                    onClick={() => setRevenueFilter(f)}
                    className={`pill px-4 py-2 capitalize transition-smooth ${
                      revenueFilter === f ? "bg-background shadow-soft" : "text-muted-foreground"
                    }`}
                  >
                    {f === "today" ? "Today" : f === "week" ? "This week" : "This month"}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <StatCard label="Revenue" value={`Rs ${revenue.toLocaleString()}`} delta={revenueFilter} icon={DollarSign} accent="primary" />
                <StatCard label="Orders" value={String(mockAnalytics.todayOrders)} delta="today" icon={ListOrdered} accent="foreground" />
                <StatCard label="Peak hour" value={mockAnalytics.peakHour} delta={`${mockAnalytics.peakOrderCount} orders`} icon={TrendingUp} accent="success" />
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Hourly orders bar chart */}
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="label-mono mb-4">● Orders by hour</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={mockAnalytics.hourlyOrders} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="orders" fill="hsl(211 100% 59%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Best sellers */}
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="label-mono mb-4">● Best sellers</div>
                  <ul className="space-y-4">
                    {mockAnalytics.bestSellers.map((item, idx) => (
                      <li key={item.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground w-5">#{idx + 1}</span>
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm">{item.sold} sold</div>
                            <div className="text-xs text-muted-foreground">Rs {item.revenue.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${(item.sold / mockAnalytics.bestSellers[0].sold) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Revenue breakdown pie */}
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="label-mono mb-4">● Revenue breakdown</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={mockAnalytics.revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {mockAnalytics.revenueBreakdown.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => `Rs ${v.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Customer stats placeholder */}
                <div className="rounded-3xl border border-border bg-background p-6">
                  <div className="label-mono mb-4">● Customer insights</div>
                  {/* TODO: Replace with real Supabase analytics query */}
                  <div className="space-y-3">
                    {[
                      { label: "Repeat customers", value: "68%" },
                      { label: "Avg order value", value: "Rs 297" },
                      { label: "Avg rating", value: `★ ${shop.rating}` },
                      { label: "Reviews", value: String(shop.reviewCount) },
                    ].map((stat) => (
                      <div key={stat.label} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className="font-mono font-semibold text-sm">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SETTINGS TAB ── */}
          {tab === "settings" && (
            <div className="max-w-xl space-y-4">
              <div className="rounded-3xl border border-border bg-background p-6">
                <div className="label-mono mb-4">Shop media</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="pill border border-border px-4 py-3 text-sm font-medium hover:bg-secondary transition-smooth focus-dashed cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Upload logo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          await updateShopAsset(file, "logo_url");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Logo upload failed");
                        } finally {
                          event.target.value = "";
                        }
                      }}
                    />
                  </label>
                  <label className="pill border border-border px-4 py-3 text-sm font-medium hover:bg-secondary transition-smooth focus-dashed cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Upload banner
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        try {
                          await updateShopAsset(file, "banner_url");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Banner upload failed");
                        } finally {
                          event.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <SettingRow
                label="Shop status"
                value={shopOpen ? "Open — accepting orders" : "Closed"}
                badge={shopOpen ? "LIVE" : "OFFLINE"}
                badgeColor={shopOpen ? "success" : "muted"}
              />
              <SettingRow
                label="Payment link"
                value={shop.paymentLink ?? "Not configured"}
                hint="Students are redirected here when checking out"
              />
              <SettingRow
                label="Default prep time"
                value={shop.prepTime}
              />
              <SettingRow
                label="Closed-day note"
                value={shop.closedNote ?? "Not set"}
                hint="Shown to customers when your shop is closed"
              />
              <SettingRow
                label="Shop slug (URL)"
                value={`theedge.com/shop/${shop.slug}`}
                hint="This cannot be changed after approval"
                readOnly
              />

              {/* Danger zone */}
              <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6">
                <div className="label-mono mb-3 text-destructive">Danger zone</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Temporarily close shop</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Customers won&apos;t be able to order until you reopen</div>
                  </div>
                  <button className="pill border border-destructive/40 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/10 transition-smooth focus-dashed">
                    Close shop
                    {/* TODO: UPDATE shop SET is_open = false in Supabase */}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// Sub-components
function StatCard({
  label, value, delta, icon: Icon, accent,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ElementType;
  accent: "primary" | "success" | "foreground" | "warning";
}) {
  const iconClass =
    accent === "primary" ? "bg-primary/10 text-primary"
    : accent === "success" ? "bg-success-soft text-success-foreground"
    : accent === "warning" ? "bg-warning/15 text-warning-foreground"
    : "bg-foreground text-background";

  return (
    <div className="rounded-3xl bg-background border border-border p-5">
      <div className="flex items-center justify-between">
        <span className="label-mono">{label}</span>
        <div className={`w-9 h-9 rounded-xl grid place-items-center ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 font-mono text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{delta}</div>
    </div>
  );
}

function SettingRow({
  label, value, hint, badge, badgeColor, readOnly,
}: {
  label: string;
  value: string;
  hint?: string;
  badge?: string;
  badgeColor?: "success" | "muted";
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="label-mono mb-1">{label}</div>
          <div className="font-medium text-sm truncate">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span className={`pill text-[10px] font-bold px-2 py-1 ${
              badgeColor === "success" ? "bg-success-soft text-success-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {badge}
            </span>
          )}
          {!readOnly && (
            <button className="pill bg-secondary px-4 py-1.5 text-sm font-medium hover:bg-accent focus-dashed transition-smooth">
              Edit
              {/* TODO: Open edit modal — UPDATE in Supabase */}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
