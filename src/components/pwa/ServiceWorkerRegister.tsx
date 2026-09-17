"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
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
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
}

