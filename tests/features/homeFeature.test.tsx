// @vitest-environment jsdom
import React from "react";
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeFeature } from "../../src/features/home/HomeFeature";
import { mapListingDtoToDomain } from "../../src/domain/listing/listing.mapper";
import type { SupabaseListingRowDTO } from "../../src/domain/listing/listing.dto";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

const MOCK_LISTINGS_DTO: SupabaseListingRowDTO[] = [
  {
    id: "lst-101",
    title: "Laptop ThinkPad T480 Core i7",
    description: "Kondisi mulus RAM 16GB SSD 512GB",
    price: 4500000,
    category: "Elektronik",
    condition: "bekas",
    is_bu: true,
    regionId: "solo",
    province_code: "33",
    regency_code: "33.72",
    district_code: "33.72.01",
    district: "Banjarsari",
    seller_id: "usr-1",
    seller_name: "Budi Store",
    seller_avatar: "",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
    views: 120,
    created_at: "2026-09-10T10:00:00Z",
    updated_at: "2026-09-10T10:00:00Z",
    status: "active",
    nego_type: "tipis",
    seller_phone: "08123456789",
  },
  {
    id: "lst-102",
    title: "Sepeda Motor Honda Vario 125",
    description: "Surat lengkap pajak jalan mulus",
    price: 12500000,
    category: "Kendaraan",
    condition: "bekas",
    is_bu: false,
    regionId: "jogja",
    province_code: "34",
    regency_code: "34.71",
    district_code: "34.71.01",
    district: "Gondokusuman",
    seller_id: "usr-2",
    seller_name: "Jogja Motor",
    seller_avatar: "",
    images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc"],
    views: 85,
    created_at: "2026-09-12T10:00:00Z",
    updated_at: "2026-09-12T10:00:00Z",
    status: "active",
    nego_type: "pas",
    seller_phone: "08987654321",
  },
];

const mockListings = MOCK_LISTINGS_DTO.map(mapListingDtoToDomain);

describe("HomeFeature (Modular Home Browsing)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mockPush.mockClear();
  });

  it("renders hero header, category pills, region pills, and listing grid", () => {
    render(<HomeFeature initialListings={mockListings} />);

    expect(screen.getAllByText(/Pusat Jual Beli Komunitas/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cari & Jual Barang Terdekat di Mana Saja/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pasang Iklan Gratis/i).length).toBeGreaterThan(0);
    expect(screen.getByTitle("Semua Kategori")).not.toBeNull();
    expect(screen.getByText("Laptop ThinkPad T480 Core i7")).not.toBeNull();
    expect(screen.getByText("Sepeda Motor Honda Vario 125")).not.toBeNull();
  });

  it("filters listings by category pill click", () => {
    render(<HomeFeature initialListings={mockListings} />);

    const kendaraanPill = screen.getAllByRole("button", { name: /Kendaraan/i })[0];
    fireEvent.click(kendaraanPill);

    expect(screen.queryByText("Laptop ThinkPad T480 Core i7")).toBeNull();
    expect(screen.getByText("Sepeda Motor Honda Vario 125")).not.toBeNull();
  });

  it("navigates to listing detail page on card click", () => {
    render(<HomeFeature initialListings={mockListings} />);

    // Click on listing card
    const cardTitle = screen.getByText("Laptop ThinkPad T480 Core i7");
    fireEvent.click(cardTitle);

    expect(mockPush).toHaveBeenCalledWith("/barang/lst-101");
  });
});
