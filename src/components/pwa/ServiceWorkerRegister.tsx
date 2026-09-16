"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      let refreshing = false;

      // Auto-reload page when new Service Worker takes over control
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("✅ [PWA] Service Worker registered with scope:", registration.scope);

            // If a new worker is waiting, activate it immediately
            if (registration.waiting) {
              registration.waiting.postMessage({ action: "skipWaiting" });
            }

            registration.onupdatefound = () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.onstatechange = () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    newWorker.postMessage({ action: "skipWaiting" });
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("⚠️ [PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}

