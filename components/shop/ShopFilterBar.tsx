"use client";

import * as React from "react";
import { ChevronDown, Store, Clock, Star, UtensilsCrossed, ArrowUpDown } from "lucide-react";
import { Shop } from "@/lib/types";

type SortOption = "default" | "rating" | "prepTime" | "name";

const prepOptions = [
  { label: "Any pickup time", value: null as number | null },
  { label: "Under 15 min", value: 15 },
  { label: "Under 30 min", value: 30 },
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Recommended", value: "default" },
  { label: "Rating", value: "rating" },
  { label: "Prep time", value: "prepTime" },
  { label: "Name (A-Z)", value: "name" },
];

function parsePrepMinutes(prepTime: string) {
  return parseInt(prepTime, 10) || Infinity;
}

function Dropdown({
  label,
  icon: Icon,
  active,
  isOpen,
  onToggle,
  onClose,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={onToggle}
        className={`pill flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap transition-smooth focus-dashed ${
          active ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-accent"
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-30 min-w-[180px] rounded-2xl shadow-elevated bg-card border border-border overflow-hidden py-1.5">
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
        selected ? "text-primary bg-primary/5" : "text-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export function ShopFilterBar({
  shops,
  onFilteredShopsChange,
}: {
  shops: Shop[];
  onFilteredShopsChange: (filtered: Shop[]) => void;
}) {
  const [openNowOnly, setOpenNowOnly] = React.useState(false);
  const [maxPrepTime, setMaxPrepTime] = React.useState<number | null>(null);
  const [highestRatedOnly, setHighestRatedOnly] = React.useState(false);
  const [category, setCategory] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<SortOption>("default");
  const [openDropdown, setOpenDropdown] = React.useState<null | "prep" | "category" | "sort">(null);

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    shops.forEach((s) => s.categories.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [shops]);

  const filteredShops = React.useMemo(() => {
    let list = shops.filter((s) => {
      if (openNowOnly && !s.isOpen) return false;
      if (maxPrepTime !== null && parsePrepMinutes(s.prepTime) > maxPrepTime) return false;
      if (highestRatedOnly && s.rating < 4.5) return false;
      if (category && !s.categories.includes(category)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "prepTime") return parsePrepMinutes(a.prepTime) - parsePrepMinutes(b.prepTime);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return Number(b.isOpen) - Number(a.isOpen);
    });

    return list;
  }, [shops, openNowOnly, maxPrepTime, highestRatedOnly, category, sortBy]);

  React.useEffect(() => {
    onFilteredShopsChange(filteredShops);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredShops]);

  const toggle = (key: "prep" | "category" | "sort") =>
    setOpenDropdown((current) => (current === key ? null : key));

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      <button
        type="button"
        onClick={() => setOpenNowOnly((v) => !v)}
        className={`pill flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap transition-smooth focus-dashed shrink-0 ${
          openNowOnly ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-accent"
        }`}
      >
        <Store className="w-4 h-4" />
        Open Now
      </button>

      <Dropdown
        label={maxPrepTime ? `Under ${maxPrepTime} min` : "Quick pickup"}
        icon={Clock}
        active={maxPrepTime !== null}
        isOpen={openDropdown === "prep"}
        onToggle={() => toggle("prep")}
        onClose={() => setOpenDropdown(null)}
      >
        {prepOptions.map((opt) => (
          <DropdownOption
            key={opt.label}
            label={opt.label}
            selected={maxPrepTime === opt.value}
            onClick={() => {
              setMaxPrepTime(opt.value);
              setOpenDropdown(null);
            }}
          />
        ))}
      </Dropdown>

      <button
        type="button"
        onClick={() => setHighestRatedOnly((v) => !v)}
        className={`pill flex items-center gap-1.5 px-4 py-2 text-sm font-medium whitespace-nowrap transition-smooth focus-dashed shrink-0 ${
          highestRatedOnly ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-accent"
        }`}
      >
        <Star className="w-4 h-4" />
        Highest rated
      </button>

      {categories.length > 0 && (
        <Dropdown
          label={category ?? "Category"}
          icon={UtensilsCrossed}
          active={category !== null}
          isOpen={openDropdown === "category"}
          onToggle={() => toggle("category")}
          onClose={() => setOpenDropdown(null)}
        >
          <DropdownOption
            label="All categories"
            selected={category === null}
            onClick={() => {
              setCategory(null);
              setOpenDropdown(null);
            }}
          />
          {categories.map((c) => (
            <DropdownOption
              key={c}
              label={c}
              selected={category === c}
              onClick={() => {
                setCategory(c);
                setOpenDropdown(null);
              }}
            />
          ))}
        </Dropdown>
      )}

      <Dropdown
        label="Sort"
        icon={ArrowUpDown}
        active={sortBy !== "default"}
        isOpen={openDropdown === "sort"}
        onToggle={() => toggle("sort")}
        onClose={() => setOpenDropdown(null)}
      >
        {sortOptions.map((opt) => (
          <DropdownOption
            key={opt.value}
            label={opt.label}
            selected={sortBy === opt.value}
            onClick={() => {
              setSortBy(opt.value);
              setOpenDropdown(null);
            }}
          />
        ))}
      </Dropdown>
    </div>
  );
}
