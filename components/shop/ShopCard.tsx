"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Shop } from "@/lib/types";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const ScrollIfLong = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const originalWidth = contentRef.current.scrollWidth;
      if (originalWidth > containerWidth) {
        setShouldScroll(true);
        setContentWidth(originalWidth + 24); // original width + 24px gap
      }
    }
  }, [children]);

  return (
    <div ref={containerRef} className="overflow-hidden w-full relative">
      <motion.div
        animate={shouldScroll ? { x: [0, -contentWidth] } : { x: 0 }}
        transition={shouldScroll ? {
          duration: contentWidth / 20, // speed
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop"
        } : {}}
        className={shouldScroll ? "flex w-max" : ""}
        style={{ gap: shouldScroll ? 24 : 0 }}
      >
        <div ref={contentRef} className={className}>
          {children}
        </div>
        {shouldScroll && (
          <div className={className}>
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface ShopCardProps {
  shop: Shop;
}

const hiddenShopTags = new Set(["halal", "gluten-free", "gluten free"]);

export const ShopCard = ({ shop }: ShopCardProps) => {
  const visibleTags = shop.tags.filter((tag) => !hiddenShopTags.has(tag.toLowerCase()));

  return (
    <article className="group flex-shrink-0 w-full snap-start transition-smooth">
      <Link
        href={`/shop/${shop.slug}`}
        id={`shop-card-${shop.id}`}
        className="flex flex-col focus-dashed"
      >
        {/* Banner Image Area */}
        <div className="relative aspect-[5/3] w-full rounded-2xl overflow-hidden bg-secondary">
          {shop.banner ? (
            <Image
              src={shop.banner}
              alt={shop.name}
              fill
              sizes="260px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-3xl">{shop.emoji}</div>
          )}

          {/* Overlay Open/Closed Pill */}
          <span
            className={`absolute top-3 right-3 pill text-[10px] font-semibold px-2 py-0.5 z-10 ${
              shop.isOpen
                ? "bg-success/90 text-success-foreground"
                : "bg-destructive/90 text-destructive-foreground"
            }`}
          >
            {shop.isOpen ? "● OPEN" : "● CLOSED"}
          </span>
        </div>

        {/* Content — no card/border/background, sits directly on the page */}
        <div className="pt-3">
          <h3 className="font-semibold text-base tracking-tight truncate">{shop.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{shop.tagline}</p>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
            <Star className="w-3.5 h-3.5 fill-foreground text-foreground shrink-0" />
            <span className="font-bold text-foreground">{shop.rating.toFixed(1)}</span>
            <span className="shrink-0">({shop.reviewCount})</span>
            <span className="shrink-0">·</span>
            <span className="truncate">{shop.prepTime}</span>
          </div>

          {shop.closedNote && (
            <ScrollIfLong className="w-max mt-2">
              <p className="text-xs text-muted-foreground italic whitespace-nowrap">
                {shop.closedNote}
              </p>
            </ScrollIfLong>
          )}

          {visibleTags.length > 0 && (
            <ScrollIfLong className="flex gap-1.5 w-max mt-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </ScrollIfLong>
          )}
        </div>
      </Link>
    </article>
  );
};
