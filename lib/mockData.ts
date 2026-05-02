// Mock Data — THE EDGE
// TODO: Replace with Supabase queries — all data should be fetched from DB

export type Shop = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  banner?: string;
  logo?: string;
  isOpen: boolean;
  closedNote?: string;
  prepTime: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  categories: string[];
  paymentLink?: string;
  ownerId?: string;
};

export type MenuItem = {
  id: string;
  shopId: string;
  title: string;
  description: string;
  image: string;
  price: number;
  discount?: number;
  category: string;
  dietaryTags: string[];
  estimatedPrepTime: string;
  availableSlots?: string[];
  maxPerOrder?: number;
  isAvailable: boolean;
  badge?: string;
  popular?: boolean;
};

export type CartItem = {
  menuItemId: string;
  shopId: string;
  quantity: number;
  notes?: string;
  diningOption: "dine-in" | "takeaway";
};

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready"
  | "completed"
  | "expired"
  | "customer_late";

export type Receipt = {
  id: string;
  orderId: string;
  shopId: string;
  pin4digit: string;
  items: CartItem[];
  pickupTime: string;
  status: OrderStatus;
};

export type Order = {
  id: string;
  userId?: string;
  items: CartItem[];
  status: OrderStatus;
  totalAmount: number;
  pickupTime: string;
  note?: string;
  createdAt: number;
  expiresAt?: number;
  perShopReceipts: Receipt[];
  code: string;
};

export type User = {
  id: string;
  email?: string;
  preferences: Record<string, unknown>;
  favShops: string[];
  favItems: string[];
  recentlyViewed: string[];
};

// ---------------------------------------------------------------------------
// MOCK SHOPS
// TODO: Replace with Supabase query — SELECT * FROM shops WHERE is_approved = true
// ---------------------------------------------------------------------------
export const mockShops: Shop[] = [
  {
    id: "rocky",
    slug: "rocksweats",
    name: "Rocky Sweats",
    tagline: "Sri Lankan sweets & milk toffee",
    description:
      "Handcrafted Sri Lankan confectionery made fresh every morning. From creamy milk toffee to cooling curd lassi — Rocky Sweats brings campus a taste of home.",
    emoji: "🍡",
    banner: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "5 min",
    rating: 4.8,
    reviewCount: 214,
    tags: ["Desserts", "Beverages", "Vegetarian"],
    categories: ["Desserts", "Drinks"],
    paymentLink: "https://pay.example/rocksweats",
  },
  {
    id: "desi",
    slug: "desipalace",
    name: "Desi Palace",
    tagline: "Hot meals, rice & curry",
    description:
      "Authentic Sri Lankan rice & curry, kottu roti, and short eats. Freshly cooked daily using traditional recipes passed down through generations.",
    emoji: "🍛",
    banner: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "12 min",
    rating: 4.7,
    reviewCount: 389,
    tags: ["Rice & Meals", "Halal", "Lunch"],
    categories: ["Rice & Meals", "Snacks"],
    paymentLink: "https://pay.example/desipalace",
  },
  {
    id: "juice",
    slug: "juicehub",
    name: "Juice Hub",
    tagline: "Cold-pressed & fresh",
    description:
      "Every cup is blended to order from fresh local fruits. No added sugar, no preservatives — just pure, cold-pressed goodness.",
    emoji: "🥤",
    banner: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "3 min",
    rating: 4.9,
    reviewCount: 502,
    tags: ["Juice", "Vegan", "Gluten-Free"],
    categories: ["Juice", "Smoothies"],
    paymentLink: "https://pay.example/juicehub",
  },
  {
    id: "snack",
    slug: "shorteats",
    name: "Short Eats Co.",
    tagline: "Crispy snacks all day",
    description:
      "Golden-fried samosas, cutlets and rolls — made in small batches all day long. The perfect snack between lectures.",
    emoji: "🥟",
    banner: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=400&fit=crop",
    isOpen: true,
    prepTime: "4 min",
    rating: 4.6,
    reviewCount: 178,
    tags: ["Snacks", "Vegan", "Quick Bite"],
    categories: ["Snacks"],
    paymentLink: "https://pay.example/shorteats",
  },
  {
    id: "brew",
    slug: "brewlab",
    name: "Brew Lab",
    tagline: "Coffee & cold brew",
    description:
      "Specialty coffee from single-origin Sri Lankan estate beans. Espresso, pour-overs, cold brews — crafted with care by certified baristas.",
    emoji: "☕",
    banner: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=400&fit=crop",
    isOpen: false,
    closedNote: "Closed for Poya Day — back tomorrow!",
    prepTime: "6 min",
    rating: 4.7,
    reviewCount: 296,
    tags: ["Coffee", "Beverages", "Vegetarian"],
    categories: ["Coffee", "Drinks"],
    paymentLink: "https://pay.example/brewlab",
  },
];

// ---------------------------------------------------------------------------
// MOCK MENU ITEMS
// TODO: Replace with Supabase query — SELECT * FROM menu_items WHERE shop_id = ? AND is_available = true
// ---------------------------------------------------------------------------
export const mockItems: MenuItem[] = [
  {
    id: "i1",
    shopId: "desi",
    title: "Egg Fried Rice",
    description: "Wok-tossed basmati with egg, leeks and carrot. Served piping hot.",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
    price: 450,
    category: "Rice & Meals",
    dietaryTags: ["Halal"],
    estimatedPrepTime: "12 min",
    availableSlots: ["11:00 AM - 4:00 PM"],
    maxPerOrder: 5,
    isAvailable: true,
    badge: "🏆 Most Ordered",
    popular: true,
  },
  {
    id: "i2",
    shopId: "desi",
    title: "Chicken Kottu",
    description: "Chopped godhamba roti stir-fried with chicken, egg, spices and leeks.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    price: 580,
    category: "Rice & Meals",
    dietaryTags: ["Halal"],
    estimatedPrepTime: "15 min",
    availableSlots: ["11:00 AM - 4:00 PM"],
    maxPerOrder: 3,
    isAvailable: true,
    popular: false,
  },
  {
    id: "i3",
    shopId: "juice",
    title: "Mango Juice",
    description: "Fresh Karuthakolomban mango, no added sugar. Cold and refreshing.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop",
    price: 280,
    category: "Juice",
    dietaryTags: ["Vegan", "Gluten-Free"],
    estimatedPrepTime: "3 min",
    isAvailable: true,
    badge: "🔥 Popular",
    popular: true,
  },
  {
    id: "i4",
    shopId: "brew",
    title: "Iced Latte",
    description: "Double shot espresso over ice with full-cream milk. Bold and creamy.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
    price: 380,
    category: "Coffee",
    dietaryTags: ["Vegetarian"],
    estimatedPrepTime: "6 min",
    isAvailable: false, // Shop is closed
    popular: false,
  },
  {
    id: "i5",
    shopId: "rocky",
    title: "Yogurt Drink",
    description: "Cool, creamy curd lassi with a hint of mint. Made fresh every hour.",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    price: 220,
    category: "Drinks",
    dietaryTags: ["Vegetarian", "Gluten-Free"],
    estimatedPrepTime: "3 min",
    isAvailable: true,
    badge: "🏆 Fan Favourite",
    popular: true,
  },
  {
    id: "i6",
    shopId: "rocky",
    title: "Milk Toffee Box",
    description: "Hand-cut classic Sri Lankan milk toffee. 12 pieces per box.",
    image: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&h=300&fit=crop",
    price: 320,
    category: "Desserts",
    dietaryTags: ["Vegetarian"],
    estimatedPrepTime: "5 min",
    isAvailable: true,
    popular: false,
  },
  {
    id: "i7",
    shopId: "snack",
    title: "Veg Samosa (3pc)",
    description: "Golden, flaky pastry with spiced potato and pea filling.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
    price: 180,
    category: "Snacks",
    dietaryTags: ["Vegan"],
    estimatedPrepTime: "4 min",
    isAvailable: true,
    badge: "🔥 Hot & Fresh",
    popular: true,
  },
  {
    id: "i8",
    shopId: "snack",
    title: "Fish Cutlets (4pc)",
    description: "Crispy fish cutlets with a spiced potato filling. Served with chilli sauce.",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
    price: 240,
    category: "Snacks",
    dietaryTags: [],
    estimatedPrepTime: "4 min",
    isAvailable: true,
    popular: false,
  },
  {
    id: "i9",
    shopId: "juice",
    title: "Watermelon Cooler",
    description: "Chilled watermelon blend with lime and chia seeds. Summer in a cup.",
    image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400&h=300&fit=crop",
    price: 260,
    category: "Juice",
    dietaryTags: ["Vegan", "Gluten-Free"],
    estimatedPrepTime: "3 min",
    isAvailable: true,
    popular: false,
  },
  {
    id: "i10",
    shopId: "desi",
    title: "Dhal Curry Plate",
    description: "Red lentil dhal with steamed rice, pol sambol and papadom.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
    price: 350,
    category: "Rice & Meals",
    dietaryTags: ["Vegan", "Gluten-Free"],
    estimatedPrepTime: "10 min",
    availableSlots: ["11:00 AM - 4:00 PM"],
    isAvailable: true,
    popular: false,
  },
];

// ---------------------------------------------------------------------------
// MOCK CATEGORIES
// TODO: Replace with Supabase query — SELECT DISTINCT category FROM menu_items
// ---------------------------------------------------------------------------
export const mockCategories = [
  { id: "rice", label: "Rice & Meals", emoji: "🍛" },
  { id: "drinks", label: "Drinks", emoji: "🥤" },
  { id: "snacks", label: "Snacks", emoji: "🥟" },
  { id: "desserts", label: "Desserts", emoji: "🍡" },
  { id: "juice", label: "Juice", emoji: "🍹" },
  { id: "coffee", label: "Coffee", emoji: "☕" },
];

// ---------------------------------------------------------------------------
// MOCK ORDERS (for vendor dashboard)
// TODO: Replace with Supabase real-time subscription — channel: orders
// ---------------------------------------------------------------------------
export const mockOrders = [
  {
    id: "ORD-A7K9",
    code: "A7K9",
    items: ["2× Egg Fried Rice", "1× Mango Juice"],
    total: 1180,
    status: "new" as OrderStatus,
    time: "2 min ago",
    note: "Extra spicy please",
    shopId: "desi",
    pickupTime: "ASAP",
  },
  {
    id: "ORD-B3M2",
    code: "B3M2",
    items: ["1× Chicken Kottu"],
    total: 580,
    status: "preparing" as OrderStatus,
    time: "8 min ago",
    shopId: "desi",
    pickupTime: "ASAP",
  },
  {
    id: "ORD-C9X1",
    code: "C9X1",
    items: ["3× Yogurt Drink"],
    total: 660,
    status: "ready" as OrderStatus,
    time: "12 min ago",
    shopId: "rocky",
    pickupTime: "+15 min",
  },
  {
    id: "ORD-D4P7",
    code: "D4P7",
    items: ["1× Egg Fried Rice", "2× Mango Juice"],
    total: 1010,
    status: "preparing" as OrderStatus,
    time: "5 min ago",
    note: "No onions on the rice",
    shopId: "desi",
    pickupTime: "+30 min",
  },
  {
    id: "ORD-E2R8",
    code: "E2R8",
    items: ["4× Veg Samosa"],
    total: 720,
    status: "new" as OrderStatus,
    time: "1 min ago",
    shopId: "snack",
    pickupTime: "ASAP",
  },
];

// ---------------------------------------------------------------------------
// MOCK ANALYTICS (for vendor analytics page)
// TODO: Replace with Supabase aggregation queries
// ---------------------------------------------------------------------------
export const mockAnalytics = {
  todayRevenue: 12480,
  todayOrders: 42,
  peakHour: "12:30 PM",
  peakOrderCount: 32,
  weekRevenue: 68400,
  monthRevenue: 287600,

  bestSellers: [
    { name: "Egg Fried Rice", sold: 40, revenue: 18000 },
    { name: "Chicken Kottu", sold: 33, revenue: 19140 },
    { name: "Dhal Curry Plate", sold: 26, revenue: 9100 },
    { name: "Fish Cutlets (4pc)", sold: 18, revenue: 4320 },
  ],

  hourlyOrders: [
    { hour: "8 AM", orders: 5 },
    { hour: "9 AM", orders: 12 },
    { hour: "10 AM", orders: 18 },
    { hour: "11 AM", orders: 32 },
    { hour: "12 PM", orders: 45 },
    { hour: "1 PM", orders: 38 },
    { hour: "2 PM", orders: 22 },
    { hour: "3 PM", orders: 15 },
    { hour: "4 PM", orders: 20 },
    { hour: "5 PM", orders: 18 },
    { hour: "6 PM", orders: 10 },
    { hour: "7 PM", orders: 6 },
  ],

  revenueBreakdown: [
    { name: "Rice & Meals", value: 8200 },
    { name: "Drinks", value: 2480 },
    { name: "Snacks", value: 1800 },
  ],
};

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------
export const shopBySlug = (slug: string) => mockShops.find((s) => s.slug === slug);
export const shopById = (id: string) => mockShops.find((s) => s.id === id);
export const itemsByShop = (shopId: string) => mockItems.filter((i) => i.shopId === shopId);
export const itemById = (id: string) => mockItems.find((i) => i.id === id);
