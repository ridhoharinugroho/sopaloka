import { useEffect, useState } from "react";

export function useDoubleBackExit(enabled: boolean = true) {
  const [showExitToast, setShowExitToast] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Push an initial root state so we have something to pop
    window.history.pushState({ root: true }, "");

    const handlePopState = (event: PopStateEvent) => {
      // User pressed back at the root level
      if (showExitToast) {
        // Double press within time window, allow exit
        window.history.back();
      } else {
        // First press: prevent exit, push state back, and show toast
        window.history.pushState({ root: true }, "");
        setShowExitToast(true);
        
        // Hide toast after 2 seconds
        setTimeout(() => {
          setShowExitToast(false);
        }, 2000);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled, showExitToast]);

  return { showExitToast };
}
