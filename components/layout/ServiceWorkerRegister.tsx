"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    if (isDesktop) {
      navigator.serviceWorker.getRegistration("/").then((registration) => {
        registration?.unregister();
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }, []);

  return null;
}
