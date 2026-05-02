"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Briefcase, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VendorLoginPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* 
        Vendor Portal: Side-by-side layout for desktop, single column for mobile/tablet.
        Professional aesthetic with a focus on business management.
      */}
      <div className="flex-1 flex flex-col lg:flex-row w-full h-full min-h-screen">
        
        {/* Auth Block */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-background relative z-10"
        >
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-bold tracking-tighter text-xl">THE EDGE</span>
              <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                Vendor
              </span>
            </Link>
          </header>

          <main className="max-w-md w-full mx-auto my-auto space-y-12 py-12 lg:py-0">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase className="w-4 h-4" />
                  <p className="label-mono font-bold">Partner Portal</p>
                </div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                  Manage your shop.<br />
                  <span className="text-muted-foreground/40 font-medium">Grow your sales.</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
                  Access your kitchen dashboard to manage live orders, update menus, and track your campus performance.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="label-mono block text-[10px]">Vendor Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                      id="email"
                      type="email"
                      placeholder="vendor@university.edu"
                      className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary/50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:bg-background transition-all text-lg outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button className="w-full h-14 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] transform group shadow-xl shadow-foreground/5 overflow-hidden relative">
                  <span className="relative z-10 flex items-center gap-2 font-semibold">
                    Access Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>

                <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Secure magic link authentication for your protection.</span>
                </div>
              </div>
            </div>
          </main>

          <footer className="flex justify-between items-center text-[10px] text-muted-foreground/40 mt-auto pt-8">
            <p>© 2026 THE EDGE · Vendor Services</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-foreground transition-colors uppercase tracking-widest font-medium">Terms</Link>
              <Link href="/auth" className="hover:text-foreground transition-colors uppercase tracking-widest font-medium">Customer Login</Link>
            </div>
          </footer>
        </motion.div>

        {/* Image Block - Professional Kitchen Visual */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:flex flex-1 relative p-6 bg-secondary/30 dark:bg-black/50 overflow-hidden"
        >
          <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl group">
            <Image
              src="/images/vendor-hero.png"
              alt="Professional Kitchen"
              fill
              className="object-cover transition-transform duration-[30s] ease-linear group-hover:scale-105"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/40" />
            
            {/* Floating Achievement/Status Card */}
            <div className="absolute top-12 right-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-light p-6 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 text-white space-y-4 max-w-[240px]"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Live Operations</h3>
                  <p className="text-sm text-white/70 leading-relaxed mt-1">
                    Your real-time command center for campus dining.
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                      {i <= 3 && <div className="h-full w-full bg-primary" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="absolute bottom-16 left-16 right-16 text-white space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-6xl font-bold tracking-tight mb-4 drop-shadow-2xl leading-[1.1]">
                  Efficiency in every order.
                </h2>
                <p className="text-xl text-white/80 max-w-md drop-shadow-xl leading-relaxed font-medium">
                  We empower local vendors with the tools to handle peak campus rush hours with zero friction.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
