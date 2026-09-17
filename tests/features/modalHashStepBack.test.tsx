// @vitest-environment jsdom
import React from "react";
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModalHash } from "../../src/hooks/useModalHash";

describe("useModalHash - Step Back Modal Navigation (Mundur 1 Modal)", () => {
  beforeEach(() => {
    // Reset window hash
    window.location.hash = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1. Automatically sets URL hash when modal opens", () => {
    const onClose = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) => useModalHash({ isOpen, onClose, hash: "detail" }),
      { initialProps: { isOpen: false } }
    );

    expect(window.location.hash).toBe("");

    rerender({ isOpen: true });
    expect(window.location.hash).toBe("#detail");
  });

  it("2. Closes modal when user presses Back (hash changes to empty)", () => {
    const onClose = vi.fn();
    renderHook(() => useModalHash({ isOpen: true, onClose, hash: "detail" }));

    expect(window.location.hash).toBe("#detail");

    // Simulate mobile browser Back button: URL hash changes from #detail to empty
    act(() => {
      window.location.hash = "";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("3. Multi-level stacked modals: Back button steps back 1 modal without closing the parent modal", () => {
    const onDetailClose = vi.fn();
    const onShareClose = vi.fn();

    // 1. User opens Detail modal (#detail)
    renderHook(
      ({ isOpen }) => useModalHash({ isOpen, onClose: onDetailClose, hash: "detail" }),
      { initialProps: { isOpen: true } }
    );
    expect(window.location.hash).toBe("#detail");

    // 2. User opens Share modal on top of Detail modal -> stack becomes #detail/share
    renderHook(
      ({ isOpen }) => useModalHash({ isOpen, onClose: onShareClose, hash: "share" }),
      { initialProps: { isOpen: true } }
    );
    expect(window.location.hash).toBe("#detail/share");

    // 3. User presses Back button once: history pops back to #detail
    act(() => {
      window.location.hash = "#detail";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    // Share modal must close!
    expect(onShareClose).toHaveBeenCalledTimes(1);
    // Detail modal must NOT close (stays open)!
    expect(onDetailClose).not.toHaveBeenCalled();

    // 4. User presses Back button second time: history pops back to root (empty hash)
    act(() => {
      window.location.hash = "";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    // Detail modal now closes!
    expect(onDetailClose).toHaveBeenCalledTimes(1);
  });

  it("4. handleSafeClose invokes onClose immediately and pops the top of stack", () => {
    const onClose = vi.fn();
    const historyBackSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useModalHash({ isOpen: true, onClose, hash: "detail" })
    );

    act(() => {
      result.current.handleSafeClose();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(historyBackSpy).toHaveBeenCalled();
  });

  it("5. 3-level stacked modals: Detail (#detail) -> Profil Toko (#profil-toko) -> Etalase Item (#detail-barang)", () => {
    const onDetailClose = vi.fn();
    const onProfileClose = vi.fn();
    const onEtalaseItemClose = vi.fn();

    // 1. User opens Product Detail modal (#detail)
    renderHook(
      ({ isOpen }) => useModalHash({ isOpen, onClose: onDetailClose, hash: "detail" }),
      { initialProps: { isOpen: true } }
    );
    expect(window.location.hash).toBe("#detail");

    // 2. User opens Seller Profile Modal (#detail/profil-toko)
    renderHook(
      ({ isOpen }) => useModalHash({ isOpen, onClose: onProfileClose, hash: "profil-toko" }),
      { initialProps: { isOpen: true } }
    );
    expect(window.location.hash).toBe("#detail/profil-toko");

    // 3. User clicks an item in the etalase (#detail/profil-toko/detail-barang)
    renderHook(
      ({ isOpen }) => useModalHash({ isOpen, onClose: onEtalaseItemClose, hash: "detail-barang" }),
      { initialProps: { isOpen: true } }
    );
    expect(window.location.hash).toBe("#detail/profil-toko/detail-barang");

    // 4. Back 1x: URL hash pops to #detail/profil-toko
    act(() => {
      window.location.hash = "#detail/profil-toko";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    // Etalase Item modal closes!
    expect(onEtalaseItemClose).toHaveBeenCalledTimes(1);
    // Profil Toko stays OPEN!
    expect(onProfileClose).not.toHaveBeenCalled();
    // Detail stays OPEN!
    expect(onDetailClose).not.toHaveBeenCalled();

    // 5. Back 2x: URL hash pops to #detail
    act(() => {
      window.location.hash = "#detail";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    // Profil Toko modal closes!
    expect(onProfileClose).toHaveBeenCalledTimes(1);
    // Detail stays OPEN!
    expect(onDetailClose).not.toHaveBeenCalled();

    // 6. Back 3x: URL hash pops to root (beranda)
    act(() => {
      window.location.hash = "";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    // Detail modal closes (back to beranda)!
    expect(onDetailClose).toHaveBeenCalledTimes(1);
  });
});
