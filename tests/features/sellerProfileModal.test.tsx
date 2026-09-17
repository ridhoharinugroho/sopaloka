// @vitest-environment jsdom
import React from "react";
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { SellerProfileModal } from "../../src/features/seller/components/SellerProfileModal";
import type { ListingSeller } from "../../src/domain/listing/listing.contract";

const mockSeller: ListingSeller = {
  id: "seller-pak-joko",
  name: "Pak Joko",
  storeName: "Toko Pak Joko Solo",
  phone: "085725012345",
  avatar: null,
};

describe("SellerProfileModal Component (Pure React)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders modal header with 'Profil Toko & Penjual' and WhatsApp action button", () => {
    render(
      <SellerProfileModal
        isOpen={true}
        onClose={() => {}}
        seller={mockSeller}
      />
    );

    // Modal Header
    expect(screen.getByText("Profil Toko & Penjual")).not.toBeNull();
    expect(screen.getByText("Komunitas Jual Beli Terpercaya Solo Raya")).not.toBeNull();

    // Store Name
    expect(screen.getByText("Toko Pak Joko Solo")).not.toBeNull();

    // WhatsApp Action Button
    const waBtn = screen.getByText("Chat Toko WA");
    expect(waBtn).not.toBeNull();
    const anchor = waBtn.closest("a");
    expect(anchor?.getAttribute("href")).toContain("6285725012345");
  });

  it("renders navigation tabs for 'Daftar Barang Jualan' and 'Ulasan & Rating'", () => {
    render(
      <SellerProfileModal
        isOpen={true}
        onClose={() => {}}
        seller={mockSeller}
      />
    );

    const itemsTab = screen.getByRole("button", { name: /Daftar Barang Jualan/i });
    const reviewsTab = screen.getByRole("button", { name: /Ulasan & Rating/i });

    expect(itemsTab).not.toBeNull();
    expect(reviewsTab).not.toBeNull();

    // Switch to Ulasan & Rating
    act(() => {
      fireEvent.click(reviewsTab);
    });

    expect(screen.getByText(/Beri Ulasan untuk Toko Pak Joko Solo/i)).not.toBeNull();
    expect(screen.getByPlaceholderText(/Ceritakan pengalaman transaksi/i)).not.toBeNull();
  });

  it("calls onClose when close button (X) is clicked", () => {
    const handleClose = vi.fn();
    render(
      <SellerProfileModal
        isOpen={true}
        onClose={handleClose}
        seller={mockSeller}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /Tutup Profil Penjual/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("can open product detail modal from etalase and back returns to seller profile", () => {
    // Render seller modal for user-103 (Rian Gadget Solo, who has sample listings)
    render(
      <SellerProfileModal
        isOpen={true}
        onClose={() => {}}
        sellerId="user-103"
        seller={{
          id: "user-103",
          name: "Rian Gadget Solo",
          storeName: "Rian Gadget Solo",
          phone: "089678123456",
          avatar: null,
        }}
      />
    );

    // Should render etalase listings
    const etalaseItem = screen.getByText(/iPhone 11 128GB Black iBox/i);
    expect(etalaseItem).not.toBeNull();

    // Click etalase item to open product detail modal
    act(() => {
      fireEvent.click(etalaseItem.closest(".cursor-pointer")!);
    });

    // Product detail modal should open on top
    expect(screen.getByTestId("etalase-item-detail-modal-overlay")).not.toBeNull();
    expect(screen.getByText(/Kembali ke Profil Toko/i)).not.toBeNull();
    expect(screen.getByText(/Detail Produk — iPhone 11 128GB Black iBox/i)).not.toBeNull();

    // Click "Kembali ke Profil Toko"
    const backToProfileBtn = screen.getByRole("button", { name: /Kembali ke Profil Toko/i });
    act(() => {
      fireEvent.click(backToProfileBtn);
    });

    // Product detail modal is closed, but Seller Profile Modal remains open!
    expect(screen.queryByTestId("etalase-item-detail-modal-overlay")).toBeNull();
    expect(screen.getByText("Profil Toko & Penjual")).not.toBeNull();
    expect(screen.getByText("Rian Gadget Solo")).not.toBeNull();
  });
});
