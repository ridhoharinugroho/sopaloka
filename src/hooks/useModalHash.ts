import { useEffect, useCallback, useRef } from "react";

export interface UseModalHashOptions {
  isOpen: boolean;
  onClose: () => void;
  hash: string;
}

/**
 * Standard Web URL Hash synchronization for modals (Modal Stack / Mundur 1 Modal).
 * - Naturally enables the mobile hardware Back button to step back 1 modal at a time.
 * - Zero manipulation: relies solely on standard browser URL hash and `hashchange` events.
 * - Safe for Next.js App Router: hash navigation does not trigger SSR or full reloads.
 */
export function useModalHash({ isOpen, onClose, hash }: UseModalHashOptions) {
  const cleanHash = hash.replace(/^#/, "");
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // 1. When modal opens, append hash segment if not already present in the stack
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isOpen) {
      const currentHash = window.location.hash.replace(/^#/, "");
      const segments = currentHash ? currentHash.split("/") : [];

      if (!segments.includes(cleanHash)) {
        const newSegments = [...segments, cleanHash];
        window.location.hash = newSegments.join("/");
      }
    }
  }, [isOpen, cleanHash]);

  // 2. Listen to hashchange: if user pressed Back button on phone/browser
  // and this modal's hash segment is no longer in the hash stack, close this modal
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      if (!isOpenRef.current) return;

      const currentHash = window.location.hash.replace(/^#/, "");
      const segments = currentHash ? currentHash.split("/") : [];

      if (!segments.includes(cleanHash)) {
        onCloseRef.current();
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [cleanHash]);

  // 3. UI close handler (X button, backdrop tap, cancel button)
  const handleSafeClose = useCallback(() => {
    onCloseRef.current();

    if (typeof window !== "undefined") {
      const currentHash = window.location.hash.replace(/^#/, "");
      const segments = currentHash ? currentHash.split("/") : [];

      // If this modal is at the top of the stack, pop it via history.back()
      if (segments.length > 0 && segments[segments.length - 1] === cleanHash) {
        try {
          window.history.back();
        } catch (_e) {}
      }
    }
  }, [cleanHash]);

  return { handleSafeClose };
}
