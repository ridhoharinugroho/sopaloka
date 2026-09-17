"use client";

import React, { useCallback } from "react";
import { useHomeFeed, UseHomeFeedProps } from "./hooks/useHomeFeed";
import { HeroHeader } from "./components/HeroHeader";
import { PromoBanner } from "./components/PromoBanner";
import { FeedPills } from "./components/FeedPills";
import { SearchFilterFeature } from "../search-filter/SearchFilterFeature";
import { ListingDetail } from "../listing/components/ListingDetail";
import type { ListingModel } from "../../domain/listing/listing.contract";
import { isFavorite } from "../../services/listingService";

export interface HomeFeatureProps extends UseHomeFeedProps {
  onCreateListingClick?: () => void;
  showFavoritesOnly?: boolean;
  selectedRegion?: string;
  onSelectRegion?: (region: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

export const HomeFeature: React.FC<HomeFeatureProps> = ({
  initialListings = [],
  onCreateListingClick,
  showFavoritesOnly = false,
  selectedRegion,
  onSelectRegion,
  selectedCategory,
  onSelectCategory,
  className = "",
}) => {
  const {
    listings,
    activeCategory: internalCategory,
    selectedListing,
    selectCategory: internalSelectCategory,
    openListingDetail,
    closeListingDetail,
  } = useHomeFeed({ initialListings });

  const activeCategory = selectedCategory !== undefined ? selectedCategory : internalCategory;
  const selectCategory = onSelectCategory || internalSelectCategory;

  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0);
  const [favVersion, setFavVersion] = React.useState<number>(0);

  React.useEffect(() => {
    const handleFavChange = () => setFavVersion((v) => v + 1);
    window.addEventListener("sopaloka:favorites_changed", handleFavChange);
    return () => window.removeEventListener("sopaloka:favorites_changed", handleFavChange);
  }, []);

  const handleListingClick = useCallback((listing: ListingModel) => {
    setActiveImageIndex(0);
    openListingDetail(listing);
  }, [openListingDetail]);

  const displayedListings = React.useMemo(() => {
    if (!showFavoritesOnly) return listings;
    return listings.filter((item) => isFavorite(item.id));
  }, [listings, showFavoritesOnly, favVersion]);

  return (
    <div className={`w-full ${className}`.trim()}>
      {/* 1. Hero Header Banner */}
      <HeroHeader onCreateListingClick={onCreateListingClick} />

      {/* 2. Search, Region Filter, Sort Bar, Category Icon Pills, and Listing Grid */}
      <SearchFilterFeature
        initialListings={displayedListings}
        category={activeCategory}
        region={selectedRegion}
        onRegionChange={onSelectRegion}
        onListingClick={handleListingClick}
        categorySlot={
          <FeedPills
            activeCategory={activeCategory}
            onSelectCategory={selectCategory}
          />
        }
      />

      {/* 5. Listing Detail Overlay / Modal View */}
      {selectedListing && (
        <ListingDetail
          listing={selectedListing}
          isOpen={Boolean(selectedListing)}
          activeImageIndex={activeImageIndex}
          onImageSelect={setActiveImageIndex}
          onClose={closeListingDetail}
        />
      )}
    </div>
  );
};
