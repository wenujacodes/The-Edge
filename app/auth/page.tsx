"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, User, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthErrorLike = {
  message?: string;
  status?: number;
  name?: string;
};

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const { data: { user: session } } = await supabase.auth.getUser();
      if (session) {
        router.replace("/browse");
      }
    };
    checkSession();
  }, [router]);

  const toggleMode = () => {
    setMode(prev => (prev === "login" ? "signup" : "login"));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: mode === "signup" ? { full_name: name } : undefined,
        },
      });

      if (error) {
        console.error("Auth error details:", {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      setSent(true);
    } catch (error: unknown) {
      const authError = error as AuthErrorLike;
      console.error("Caught auth error:", error);
      
      if (authError.status === 429 || authError.message?.includes("rate limit")) {
        // Offer bypass in dev mode
        const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (isDev) {
          const proceed = confirm("Email rate limit exceeded. Since you are in local development, would you like to bypass the email and log in instantly?");
          if (proceed) {
            handleBypass();
          }
        } else {
          alert("Email rate limit exceeded. Since we are in the testing phase, you may need to increase the 'Email Rate Limit' in your Supabase Dashboard (Authentication -> Settings -> Email Auth).");
        }
      } else if (authError.message === "Failed to fetch") {
        alert("Network error: Failed to reach Supabase. Please check your internet connection or if the Supabase project is active.");
      } else {
        alert(authError.message || "Failed to send magic link");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBypass = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { devAuthBypass } = await import("./actions");
      const result = await devAuthBypass(email);
      if (result.error) throw new Error(result.error);
      if (result.actionLink) {
        window.location.href = result.actionLink;
      }
    } catch (error: unknown) {
      const authError = error as AuthErrorLike;
      alert("Bypass failed: " + (authError.message || "Unknown error"));
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-8"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Mail className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We&apos;ve sent a magic link to <span className="text-foreground font-bold">{email}</span>.{" "}
            Click the link in the email to sign in instantly.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => setSent(false)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Didn&apos;t get the email? Try again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* 
        Container that handles the layout swap.
        The layout transition is preserved as it's the primary "move" effect.
      */}
      <div 
        className={`flex-1 flex flex-col lg:flex-row w-full h-full min-h-screen ${
          mode === "signup" ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        
        {/* Auth Block */}
        <motion.div 
          layout
          transition={{
            layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-background relative z-10"
        >
          <header className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
              THE EDGE
            </Link>
          </header>

          <main className="max-w-md w-full mx-auto my-auto space-y-12 py-12 lg:py-0">
            {/* Removed AnimatePresence for lighter performance */}
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="label-mono text-primary font-bold">
                  {mode === "login" ? "Sign In" : "Get Started"}
                </p>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                  {mode === "login" ? (
                    <>Skip the line.<br /><span className="text-muted-foreground/40">Order ahead.</span></>
                  ) : (
                    <>Join the list.<br /><span className="text-muted-foreground/40">Eat better.</span></>
                  )}
                </h1>
                <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
                  {mode === "login" 
                    ? "Enter your email — we'll send a magic link. No passwords, ever."
                    : "Create your account to save your favorites and order faster across campus."
                  }
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-5">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <label htmlFor="name" className="label-mono block text-[10px]">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          id="name"
                          type="text"
                          placeholder="Your Name"
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary/50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:bg-background transition-all text-lg outline-none"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="label-mono block text-[10px]">Campus Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@university.edu"
                        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary/50 dark:bg-white/5 border border-transparent focus:border-primary/20 focus:bg-background transition-all text-lg outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAuth}
                  disabled={loading}
                  className="w-full h-14 mt-4 bg-foreground text-background font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] transform group shadow-xl shadow-foreground/5 overflow-hidden relative disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        {mode === "login" ? "Send magic link" : "Create account"}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>

                <div className="pt-2 flex flex-col items-center gap-4">
                  <button 
                    onClick={toggleMode}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    {mode === "login" ? (
                      <>New here? <span className="text-foreground font-bold border-b-2 border-primary/40 hover:border-primary transition-colors ml-1">Create an account</span></>
                    ) : (
                      <>Already have an account? <span className="text-foreground font-bold border-b-2 border-primary/40 hover:border-primary transition-colors ml-1">Sign in</span></>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 text-[11px] text-muted-foreground leading-snug">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <p>
                  By continuing, you agree to THE EDGE&apos;s{" "}
                  <Link href="/terms" className="underline hover:text-foreground font-medium">Terms</Link> and{" "}
                  <Link href="/privacy" className="underline hover:text-foreground font-medium">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </main>

          <footer className="flex justify-between items-center text-[10px] text-muted-foreground/40 mt-auto pt-8">
            <p>© 2026 THE EDGE · All rights reserved</p>
            <Link href="/vendor/login" className="hover:text-foreground transition-colors flex items-center gap-1 font-medium uppercase tracking-widest">
              Vendor sign in <ArrowRight className="w-3 h-3" />
            </Link>
          </footer>
        </motion.div>

        {/* Image Block - Hidden on mobile and tablet (lg breakpoint) */}
        <motion.div 
          layout
          transition={{
            layout: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }}
          className="hidden lg:flex flex-1 relative p-6 bg-secondary/50 dark:bg-black/50 overflow-hidden"
        >
          <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-2xl group">
            <Image
              src="/images/auth-hero.png"
              alt="The Edge Campus Food"
              fill
              className="object-cover transition-transform duration-[20s] ease-linear group-hover:scale-110"
              priority
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Floating UI elements */}
            <div className="absolute top-8 left-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-light px-4 py-2.5 rounded-full flex items-center gap-2 text-white text-sm font-semibold shadow-2xl backdrop-blur-md border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-black animate-pulse" />
                <span>v2.0 coming soon</span>
              </motion.div>
            </div>

            <div className="absolute bottom-16 left-16 right-16 text-white space-y-4">
              <div className="space-y-4">
                <h2 className="text-6xl font-bold tracking-tight mb-4 drop-shadow-xl leading-[1.1]">
                  {mode === "login" ? "Your campus, served faster." : "The better way to dine."}
                </h2>
                <p className="text-xl text-white/80 max-w-md drop-shadow-lg leading-relaxed font-medium">
                  {mode === "login" 
                    ? "Order from every shop on campus. Pay once. Pick up when it's ready — no more queues."
                    : "Save your favorite meals, track your budget, and get exclusive campus-only offers."
                  }
                </p>
              </div>
              
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
