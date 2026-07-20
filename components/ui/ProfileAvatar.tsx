"use client";

import * as React from "react";
import Image from "next/image";

/**
 * Standard Profile Avatar component.
 * Uses custom uploaded profile icons (black for light mode, white for dark mode).
 */
export function ProfileAvatar({ className = "", iconSize = 20 }: { className?: string, iconSize?: number }) {
  return (
    <div 
      className={`relative flex items-center justify-center profile-avatar overflow-hidden ${className}`}
    >
      <Image
        src="/images/profile-icon-black.png"
        alt="Profile"
        fill
        className="object-cover dark:hidden"
      />
      <Image
        src="/images/profile-icon-white.png"
        alt="Profile"
        fill
        className="object-cover hidden dark:block"
      />
    </div>
  );
}
