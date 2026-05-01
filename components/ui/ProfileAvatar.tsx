"use client";

import * as React from "react";

export const regenerateProfileHue = () => {
  if (typeof window !== "undefined") {
    const newHue = Math.floor(Math.random() * 360);
    localStorage.setItem("profile-hue", newHue.toString());
    window.dispatchEvent(new CustomEvent("profile-hue-changed", { detail: newHue }));
  }
};

export function ProfileAvatar({ className = "", iconSize = 20 }: { className?: string, iconSize?: number }) {
  const [hue, setHue] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Generate a consistent random hue per user/browser
    const stored = localStorage.getItem("profile-hue");
    if (stored) {
      setHue(parseInt(stored, 10));
    } else {
      const newHue = Math.floor(Math.random() * 360);
      localStorage.setItem("profile-hue", newHue.toString());
      setHue(newHue);
    }

    const handleHueChange = (e: any) => {
      setHue(e.detail);
    };

    window.addEventListener("profile-hue-changed", handleHueChange);
    return () => window.removeEventListener("profile-hue-changed", handleHueChange);
  }, []);

  if (hue === null) {
    return <div className={`rounded-full bg-secondary ${className}`} />;
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center profile-avatar overflow-hidden ${className}`}
      style={{ "--profile-hue": hue } as React.CSSProperties}
    >
      <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="35" r="18" />
        <circle cx="50" cy="112" r="52" />
      </svg>
    </div>
  );
}
