"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Copy, Share2, X } from "lucide-react";
import { toast } from "sonner";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2.003c-5.517 0-9.997 4.48-9.997 9.997 0 1.762.463 3.484 1.343 4.997L2 22l5.13-1.345a9.965 9.965 0 004.871 1.24h.004c5.516 0 9.996-4.48 9.996-9.997 0-2.67-1.04-5.18-2.928-7.07a9.935 9.935 0 00-7.072-2.825zm0 18.187a8.19 8.19 0 01-4.169-1.14l-.299-.177-3.045.799.813-2.968-.194-.305a8.19 8.19 0 01-1.257-4.372c0-4.527 3.684-8.211 8.216-8.211a8.16 8.16 0 015.812 2.41 8.163 8.163 0 012.404 5.806c-.001 4.528-3.685 8.213-8.281 8.213z" />
    </svg>
  );
}

const SHARE_MESSAGE = "Join The Edge, it's awesome! Order ahead and skip the queue at your campus canteen.";

export function InviteFriendsModal() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const link = typeof window !== "undefined" ? window.location.origin : "";
  const fullMessage = `${SHARE_MESSAGE}\n\n${link}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/50 transition-smooth text-left border-b border-border/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <div className="font-bold text-[16px]">Invite Friends</div>
            <div className="text-[12px] text-muted-foreground font-medium">Share The Edge with your friends</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 p-4">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="w-full max-w-md bg-background shadow-elevated rounded-[2.5rem] p-6 sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold tracking-tight">Invite friends</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-secondary rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-3xl bg-secondary/50 p-5 mb-6">
                <p className="text-sm leading-relaxed">{SHARE_MESSAGE}</p>
                <p className="mt-3 font-mono text-xs text-muted-foreground break-all">{link}</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleWhatsApp}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Share on WhatsApp
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-secondary text-foreground font-bold text-sm hover:bg-accent active:scale-[0.98] transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
