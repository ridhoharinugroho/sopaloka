"use client";

import React, { useState } from "react";
import type { ListingModel } from "../../../domain/listing/listing.contract";
import { useModalHash } from "../../../hooks/useModalHash";
import { SellerProfileModal } from "../../seller/components/SellerProfileModal";
import { ListingDetailView } from "./ListingDetailView";

export interface ListingDetailProps {
  listing: ListingModel | null;
  isOpen: boolean;
  activeImageIndex?: number;
  onImageSelect?: (index: number) => void;
  onClose: () => void;
  onContactClick?: (phone: string, title: string) => void;
  onShareClick?: (listing: ListingModel) => void;
  onViewSellerProfile?: (sellerId: string) => void;
  className?: string;
  isPage?: boolean;
  hash?: string;
  zIndexClass?: string;
  backLabel?: string;
  onBack?: () => void;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
  isOpen,
  activeImageIndex,
  onImageSelect,
  onClose,
  onContactClick,
  onShareClick,
  onViewSellerProfile,
  className = "",
  isPage = false,
  hash = "detail",
  zIndexClass,
  backLabel,
  onBack,
}) => {
  const [isSellerProfileOpen, setIsSellerProfileOpen] = useState(false);

  const { handleSafeClose } = useModalHash({
    isOpen: Boolean(isOpen && listing && !isPage),
    onClose,
    hash,
  });

  const handleViewSeller = (sellerId: string) => {
    if (onViewSellerProfile) {
      onViewSellerProfile(sellerId);
    } else {
      setIsSellerProfileOpen(true);
    }
  };

  if (!isOpen || !listing) return null;

  const content = (
    <>
      <ListingDetailView
        listing={listing}
        activeImageIndex={activeImageIndex}
        onImageSelect={onImageSelect}
        onClose={handleSafeClose}
        onBack={onBack}
        backLabel={backLabel}
        onContactClick={onContactClick}
        onShareClick={onShareClick}
        onViewSellerProfile={handleViewSeller}
        className={className}
        isPage={isPage}
      />
      {/* Multi-Level Stacked Seller Profile Modal */}
      <SellerProfileModal
        isOpen={isSellerProfileOpen}
        onClose={() => setIsSellerProfileOpen(false)}
        seller={listing.seller}
        sellerId={listing.seller?.id}
      />
    </>
  );

  if (isPage) {
    return content;
  }

  return (
    <div
      className={`fixed inset-0 ${zIndexClass || "z-[10000]"} flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in`}
      onClick={handleSafeClose}
      data-testid="listing-detail-modal-overlay"
    >
      {content}
    </div>
  );
};
