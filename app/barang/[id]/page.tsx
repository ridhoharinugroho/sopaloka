"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "../../../src/components/layout/AppShell";
import { ListingDetail } from "../../../src/features/listing/components/ListingDetail";
import { getPublicListings, getListingById } from "../../../src/services/listingService";
import { mapListingDtoToDomain } from "../../../src/domain/listing/listing.mapper";
import type { ListingModel } from "../../../src/domain/listing/listing.contract";
import { supabase } from "../../../src/lib/supabase";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingModel | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const listingId = params?.id as string;
    if (!listingId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const findAndSetListing = () => {
      // 1. Try from memory / local listings
      const raw = getListingById(listingId);
      if (raw) {
        if (isMounted) {
          setListing(mapListingDtoToDomain(raw));
          setIsLoading(false);
        }
        return true;
      }
      
      const allListings = getPublicListings().map((item: any) => mapListingDtoToDomain(item));
      const found = allListings.find((item: ListingModel) => String(item.id).trim() === String(listingId).trim());
      if (found) {
        if (isMounted) {
          setListing(found);
          setIsLoading(false);
        }
        return true;
      }
      return false;
    };

    // Immediate check
    const foundLocal = findAndSetListing();

    // 2. Fetch directly from Supabase if not found locally
    if (!foundLocal && supabase) {
      setIsLoading(true);
      (async () => {
        try {
          const { data, error } = await supabase
            .from("listings")
            .select("*")
            .eq("id", listingId)
            .maybeSingle();
          if (!isMounted) return;
          if (!error && data) {
            setListing(mapListingDtoToDomain(data));
          }
        } catch (e) {
          // ignore error
        } finally {
          if (isMounted) setIsLoading(false);
        }
      })();
    } else if (!foundLocal) {
      setIsLoading(false);
    }

    // 3. Listen for Supabase background updates broadcast
    const handleListingsUpdate = () => {
      findAndSetListing();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("sopaloka:listings_updated", handleListingsUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("sopaloka:listings_updated", handleListingsUpdate);
      }
    };
  }, [params]);

  if (isLoading && !listing) {
    return (
      <AppShell activeTab="home">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <h2 className="text-lg font-bold text-slate-800">Memuat detail barang...</h2>
          <p className="text-xs text-slate-500 mt-1">SOPALOKA — Pusat Jual Beli Terdekat</p>
        </div>
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell activeTab="home">
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-lg font-bold text-slate-800">Barang Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">Iklan ini mungkin sudah dihapus atau tidak tersedia.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Kembali ke Beranda
          </button>
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
