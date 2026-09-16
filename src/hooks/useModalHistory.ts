import { useEffect, useRef } from "react";

export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string = "modal") {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    // Push a dummy state to history when modal opens
    window.history.pushState({ modal: modalId }, "");
    pushedRef.current = true;

    const handlePopState = () => {
      // Browser already popped history entry via hardware back button
      pushedRef.current = false;
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);

      // Cleanup: if modal closes programmatically (e.g. user clicked X or background),
      // pop dummy state. If closed via Back button, pushedRef.current is already false.
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      }
    };
  }, [isOpen, onClose, modalId]);
}
