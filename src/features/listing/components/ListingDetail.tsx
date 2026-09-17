import React, { useState } from "react";
import type { ListingModel } from "../../../domain/listing/listing.contract";
import { ListingGallery } from "./ListingGallery";
import { ListingMetadata } from "./ListingMetadata";
import { ListingActions } from "./ListingActions";
import { useModalHash } from "../../../hooks/useModalHash";
import { SocialShareModal } from "../../../components/modals/SocialShareModal";

export interface ListingDetailProps {
  listing: ListingModel | null;
  isOpen: boolean;
  activeImageIndex: number;
  onImageSelect: (index: number) => void;
  onClose: () => void;
  onContactClick?: (phone: string, title: string) => void;
  onShareClick?: (listing: ListingModel) => void;
  className?: string;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
  isOpen,
  activeImageIndex,
  onImageSelect,
  onClose,
  onContactClick,
  onShareClick,
  className = "",
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { handleSafeClose } = useModalHash({
    isOpen: Boolean(isOpen && listing),
    onClose,
    hash: "detail",
  });

  const handleShare = () => {
    if (onShareClick) {
      onShareClick(listing!);
    } else {
      setIsShareModalOpen(true);
    }
  };

  if (!isOpen || !listing) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
      onClick={handleSafeClose}
      data-testid="listing-detail-modal-overlay"
    >
      <div
        className={`relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-sm font-bold text-gray-800 truncate pr-4">
            Detail Produk — {listing.title}
          </h2>
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleSafeClose}
              aria-label="Tutup Detail"
              className="sr-only"
            >
              Tutup Detail
            </button>
            <button
              type="button"
              onClick={handleSafeClose}
              aria-label="Tutup modal detail"
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gallery Section */}
            <ListingGallery
              images={listing.images}
              title={listing.title}
              activeIndex={activeImageIndex}
              onImageSelect={onImageSelect}
            />

            {/* Metadata Section */}
            <ListingMetadata listing={listing} />
          </div>

          {/* Actions Bar Section */}
          <ListingActions
            listing={listing}
            onContactClick={onContactClick}
            onShareClick={handleShare}
            onClose={handleSafeClose}
          />
        </div>
      </div>

      {/* Multi-Level Stacked Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listing={listing}
      />
    </div>
  );
};
