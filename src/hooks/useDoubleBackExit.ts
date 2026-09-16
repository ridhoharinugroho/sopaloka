import { useEffect, useState, useRef } from "react";

export function useDoubleBackExit(enabled: boolean = true) {
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackTimeRef = useRef<number>(0);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Push an initial root state so back gesture hits this entry first
    window.history.pushState({ sopalokaRoot: true }, "");

    const handlePopState = () => {
      const now = Date.now();

      if (now - lastBackTimeRef.current < 2000) {
        // Second press within 2 seconds: exit app
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setShowExitToast(false);
        window.history.back();
      } else {
        // First press: prevent exit, re-push root state and show toast
        lastBackTimeRef.current = now;
        window.history.pushState({ sopalokaRoot: true }, "");
        setShowExitToast(true);

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setShowExitToast(false);
        }, 2000);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [enabled]);

  return { showExitToast };
}

