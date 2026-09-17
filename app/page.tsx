"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../src/components/layout/AppShell";
import { HomeFeature } from "../src/features/home/HomeFeature";
import { NotificationFeature } from "../src/features/notification/NotificationFeature";
import { ListingForm } from "../src/features/listing-management/components/ListingForm";
import { getPublicListings } from "../src/services/listingService";
import { mapListingDtoToDomain } from "../src/domain/listing/listing.mapper";
import { TraktirKopiModal } from "../src/components/modals/TraktirKopiModal";
import { ReviewFeature } from "../src/features/review/ReviewFeature";
import { AuthModal } from "../src/features/auth/AuthModal";
import { ProfileModal } from "../src/features/profile/components/ProfileModal";
import { FilterModal } from "../src/features/search-filter/components/FilterModal";
import { isUserLoggedIn } from "../src/services/authService";
import { useModalHash } from "../src/hooks/useModalHash";
import { X } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [isTraktirKopiModalOpen, setIsTraktirKopiModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"home" | "favorites" | "filters" | "reviews" | "toko-saya" | "profile">("home");

  const { handleSafeClose: closeNotifModal } = useModalHash({
    isOpen: isNotifModalOpen,
    onClose: () => setIsNotifModalOpen(false),
    hash: "notif",
  });

  const { handleSafeClose: closeCreateListingModal } = useModalHash({
    isOpen: isCreateListingModalOpen,
    onClose: () => setIsCreateListingModalOpen(false),
    hash: "pasang-iklan",
  });

  const { handleSafeClose: closeTraktirKopiModal } = useModalHash({
    isOpen: isTraktirKopiModalOpen,
    onClose: () => setIsTraktirKopiModalOpen(false),
    hash: "traktir-kopi",
  });

  const { handleSafeClose: closeReviewsModal } = useModalHash({
    isOpen: isReviewsModalOpen,
    onClose: () => {
      setIsReviewsModalOpen(false);
      setActiveTab("home");
    },
    hash: "reviews",
  });

  const { handleSafeClose: closeAuthModal } = useModalHash({
    isOpen: isAuthModalOpen,
    onClose: () => {
      setIsAuthModalOpen(false);
      setActiveTab("home");
    },
    hash: "auth",
  });

  const { handleSafeClose: closeProfileModal } = useModalHash({
    isOpen: isProfileModalOpen,
    onClose: () => {
      setIsProfileModalOpen(false);
      setActiveTab("home");
    },
    hash: "profile",
  });

  const { handleSafeClose: closeFilterModal } = useModalHash({
    isOpen: isFilterModalOpen,
    onClose: () => setIsFilterModalOpen(false),
    hash: "filter",
  });

  // Close open modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotifModalOpen(false);
        setIsCreateListingModalOpen(false);
        setIsTraktirKopiModalOpen(false);
        setIsReviewsModalOpen(false);
        setIsAuthModalOpen(false);
        setIsProfileModalOpen(false);
        setIsFilterModalOpen(false);
        setActiveTab("home");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeAllModals = () => {
    setIsNotifModalOpen(false);
    setIsCreateListingModalOpen(false);
    setIsTraktirKopiModalOpen(false);
    setIsReviewsModalOpen(false);
    setIsAuthModalOpen(false);
    setIsProfileModalOpen(false);
    setIsFilterModalOpen(false);
  };

  const handleProfileNavClick = () => {
    closeAllModals();
    setActiveTab("profile");
    if (isUserLoggedIn()) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleTokoSayaNavClick = () => {
    if (!isUserLoggedIn()) {
      closeAllModals();
      setIsAuthModalOpen(true);
    } else {
      router.push("/toko-saya");
    }
  };

  const initialListings = getPublicListings().map((item: any) => mapListingDtoToDomain(item));
  const listingSuggestions = Array.from(new Set(initialListings.map((item: any) => item.title)));

  return (
    <>
      <AppShell
        suggestions={listingSuggestions}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "reviews") {
            closeAllModals();
            setIsReviewsModalOpen(true);
          } else if (tab === "profile") {
            handleProfileNavClick();
          } else if (tab === "toko-saya") {
            handleTokoSayaNavClick();
          } else if (tab === "filters") {
            closeAllModals();
            setIsFilterModalOpen(true);
          } else if (tab === "home" || tab === "favorites") {
            closeAllModals();
            setActiveTab(tab);
          }
        }}
        onFavoritesClick={() => {
          closeAllModals();
          setActiveTab(activeTab === "favorites" ? "home" : "favorites");
        }}
        onFilterClick={() => {
          closeAllModals();
          setIsFilterModalOpen(true);
        }}
        onNotificationClick={() => {
          closeAllModals();
          setIsNotifModalOpen(true);
        }}
        onCreateListingClick={() => {
          closeAllModals();
          setIsCreateListingModalOpen(true);
        }}
        onTraktirKopiClick={() => {
          closeAllModals();
          setIsTraktirKopiModalOpen(true);
        }}
        onSearchSubmit={(query) => {
          window.dispatchEvent(new CustomEvent("sopaloka:search_submitted", { detail: query }));
        }}
        onProfileClick={handleProfileNavClick}
      >
        <HomeFeature
          initialListings={initialListings}
          showFavoritesOnly={activeTab === "favorites"}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onCreateListingClick={() => setIsCreateListingModalOpen(true)}
        />
      </AppShell>

      {/* Traktir Kopi Modal */}
      <TraktirKopiModal
        isOpen={isTraktirKopiModalOpen}
        onClose={closeTraktirKopiModal}
      />

      {/* Filter Modal (Wilayah & Kategori) */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        selectedRegion={selectedRegion}
        selectedCategory={selectedCategory}
        onApply={(region, category) => {
          setSelectedRegion(region);
          setSelectedCategory(category);
        }}
      />

      {/* Notification Center Modal */}
      {isNotifModalOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={closeNotifModal}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <NotificationFeature onClose={closeNotifModal} />
          </div>
        </div>
      )}

      {/* Pasang Iklan / Create Listing Modal */}
      {isCreateListingModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={closeCreateListingModal}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeCreateListingModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup Form"
            >
              <X className="w-5 h-5" />
            </button>
            <ListingForm
              onClose={closeCreateListingModal}
            />
          </div>
        </div>
      )}

      {/* Ulasan & Rating Komunitas Modal */}
      {isReviewsModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={closeReviewsModal}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeReviewsModal}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup Ulasan"
            >
              <X className="w-5 h-5" />
            </button>
            <ReviewFeature sellerId="user-1787309560138" sellerName="Komunitas SOPALOKA" />
          </div>
        </div>
      )}

      {/* Auth Modal (Untuk Pengguna yang Belum Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onOpenReviews={() => {
          setIsAuthModalOpen(false);
          setIsReviewsModalOpen(true);
        }}
      />

      {/* Profile Modal (Untuk Pengguna yang Sudah Login) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        onOpenReviews={() => {
          setIsProfileModalOpen(false);
          setIsReviewsModalOpen(true);
        }}
        onLogoutSuccess={() => {
          setIsProfileModalOpen(false);
          setActiveTab("home");
        }}
      />
    </>
  );
}


