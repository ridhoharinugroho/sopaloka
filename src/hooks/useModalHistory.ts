import { useEffect } from "react";

export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string = "modal") {
  useEffect(() => {
    if (!isOpen) return;

    // Push a dummy state to history when modal opens
    window.history.pushState({ modal: modalId }, "");

    const handlePopState = (event: PopStateEvent) => {
      // If user pressed back, close the modal
      onClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      
      // Cleanup: if modal closes programmatically (e.g. user clicked X), 
      // we should pop the dummy state to keep history clean
      if (window.history.state?.modal === modalId) {
        window.history.back();
      }
    };
  }, [isOpen, onClose, modalId]);
}
