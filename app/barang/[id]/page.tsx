"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "../../../src/components/layout/AppShell";
import { ListingDetail } from "../../../src/features/listing/components/ListingDetail";
import { getPublicListings } from "../../../src/services/listingService";
import { mapListingDtoToDomain } from "../../../src/domain/listing/listing.mapper";
import type { ListingModel } from "../../../src/domain/listing/listing.contract";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingModel | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const listingId = params?.id as string;
    if (listingId) {
      const allListings = getPublicListings().map((item: any) => mapListingDtoToDomain(item));
      const found = allListings.find((item: ListingModel) => item.id === listingId);
      if (found) {
        setListing(found);
      }
    }
  }, [params]);

  if (!listing) {
    return (
      <AppShell activeTab="home">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-lg font-bold text-slate-800">Memuat detail barang...</h2>
          <p className="text-xs text-slate-500 mt-1">SOPALOKA — Pusat Jual Beli Terdekat</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeTab="home">
      <div className="max-w-2xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
        <ListingDetail
          listing={listing}
          isOpen={true}
          isPage={true}
          activeImageIndex={activeImageIndex}
          onImageSelect={setActiveImageIndex}
          onClose={() => router.back()}
          className="shadow-none border-0 max-h-none my-0 rounded-none sm:rounded-3xl"
        />
      </div>
    </AppShell>
  );
}
