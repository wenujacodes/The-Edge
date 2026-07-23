"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export const PWABanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(true); // Default to true to prevent hydration flash
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Native-app-style install prompt is a mobile-only concept — desktop/web never sees it.
    if (window.matchMedia("(min-width: 768px)").matches) {
      return;
    }

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as any).standalone === true);

    const isInstalledPreviously = localStorage.getItem("pwa_installed") === "true";
    const isDismissedThisSession = sessionStorage.getItem("pwa_prompt_dismissed") === "true";

    if (isStandalone || isInstalledPreviously || isDismissedThisSession) {
      if (isStandalone) {
        localStorage.setItem("pwa_installed", "true");
      }
      setIsInstalled(true);
      return;
    }

    setIsInstalled(false);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem("pwa_installed", "true");
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_prompt_dismissed", "true");
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setIsInstalling(false);

    if (choice.outcome === "accepted") {
      localStorage.setItem("pwa_installed", "true");
      setDismissed(true);
    } else {
      handleDismiss();
    }
  };

  // Only worth showing once we can actually act: on Android/Chrome that means the real
  // native install prompt has been captured, so the button below fires the browser's own
  // "Install app?" permission dialog. iOS has no such API, so instructions are all we can offer.
  const canAct = isIOS || Boolean(installPrompt);
  const open = !isInstalled && !dismissed && canAct;

  useEffect(() => {
    if (open) {
      sessionStorage.setItem("pwa_prompt_dismissed", "true");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-[70] bg-black/60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[70] bg-background rounded-t-[2rem] shadow-elevated"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
          >
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="w-9 h-9 rounded-full grid place-items-center bg-secondary hover:bg-secondary/70 transition-colors focus-dashed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center px-8 pb-2">
              <div className="relative w-20 h-20 rounded-[1.4rem] overflow-hidden shadow-soft mb-4">
                <Image src="/icons/icon-192.png" alt="The Edge" fill sizes="80px" className="object-cover" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Install The Edge</h2>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-xs">
                {isIOS
                  ? "Tap the Share icon in Safari, then “Add to Home Screen” for a faster, full-screen experience."
                  : "Add it to your home screen for more native experience."}
              </p>
            </div>

            <div className="px-6 pt-5 space-y-2.5">
              {isIOS ? (
                <button
                  onClick={handleDismiss}
                  className="w-full h-14 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-colors"
                >
                  Got it
                </button>
              ) : (
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="w-full h-14 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-colors disabled:opacity-60"
                >
                  {isInstalling ? "Installing…" : "Add to Home Screen"}
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="w-full h-11 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
