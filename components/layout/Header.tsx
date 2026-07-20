"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Home, Compass, ReceiptText, User } from "lucide-react";
import { useCart } from "@/store/cart";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";

export const Header = () => {
  const count = useCart((s) => s.count());
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Compass },
    { href: "/orders", label: "Orders", icon: ReceiptText },
  ];

  const isHome = pathname === "/";

  return (
    <header 
      className={`hidden md:block fixed w-full top-0 z-40 transition-all duration-300 ${
        !isHome || scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" id="header-logo">
          <span className="font-bold tracking-tight text-xl">The Edge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-dashed transition-smooth hover:text-primary ${
                pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/cart"
              id="header-cart-btn"
              className="relative inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-medium transition-smooth focus-dashed"
            >
              <div className="relative w-6 h-6">
                <Image src="/icons/cart-black.svg" alt="Cart" fill className="dark:hidden object-contain" />
                <Image src="/icons/cart-white.svg" alt="Cart" fill className="hidden dark:block object-contain" />
              </div>
              <span>Cart</span>
              {mounted && count > 0 && (
                <span className="ml-1 inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold animate-scale-in">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className="w-10 h-10 overflow-hidden hover:opacity-80 transition-smooth focus-dashed flex items-center justify-center"
              aria-label="Profile"
            >
              <ProfileAvatar className="w-full h-full" iconSize={20} />
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

