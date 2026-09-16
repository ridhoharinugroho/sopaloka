import { useState, useMemo, useCallback } from "react";
import type { ListingModel } from "../../../domain/listing/listing.contract";
import type { FilterState } from "../../../domain/filter/filter.contract";
import { mapListingDtoToDomain } from "../../../domain/listing/listing.mapper";
import { mapFilterDtoToDomain } from "../../../domain/filter/filter.mapper";
import type { SupabaseListingRowDTO } from "../../../domain/listing/listing.dto";

export interface UseSearchFilterProps {
  initialListings?: SupabaseListingRowDTO[] | ListingModel[];
  category?: string;
}

export function useSearchFilter({ initialListings = [], category }: UseSearchFilterProps = {}) {
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const base = mapFilterDtoToDomain(null);
    if (category) {
      base.category = category;
    }
    return base;
  });

  // Effective category considers prop priority over internal state
  const effectiveCategory = category !== undefined ? category : filterState.category;

  // Normalize input listings into canonical ListingModel domain models
  const domainListings = useMemo(() => {
    return initialListings.map((item) =>
      "negoType" in item ? (item as ListingModel) : mapListingDtoToDomain(item as SupabaseListingRowDTO)
    );
  }, [initialListings]);

  // Pure filtering logic
  const filteredListings = useMemo(() => {
    const q = filterState.searchQuery.trim().toLowerCase();
    const cat = effectiveCategory;
    const regId = filterState.regionId;
    const distName = filterState.district;
    const provCode = filterState.provinceCode;
    const regCode = filterState.regencyCode;
    const distCode = filterState.districtCode;
    const minP = filterState.minPrice;
    const maxP = filterState.maxPrice;
    const cond = filterState.condition;
    const isBuOnly = filterState.isBu;
    const sort = filterState.sortBy;

    return domainListings
      .filter((listing) => {
        // 1. Keyword search
        if (q) {
          const matchTitle = listing.title.toLowerCase().includes(q);
          const matchDesc = listing.description.toLowerCase().includes(q);
          const matchCat = listing.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // 2. Category filter
        if (cat && cat !== "all" && listing.category.toLowerCase() !== cat.toLowerCase()) {
          return false;
        }

        // 3. Location filter (BPS Code preferred, legacy regionId/district fallback)
        if (provCode && listing.provinceCode && listing.provinceCode !== provCode) {
          return false;
        }
        if (regCode) {
          const cleanRegCode = regCode.replace(/\./g, "");
          const cleanListingRegCode = (listing.regencyCode || "").replace(/\./g, "");
          if (!cleanListingRegCode || cleanListingRegCode !== cleanRegCode) {
            return false;
          }
        }
        if (distCode) {
          const cleanDistCode = distCode.replace(/\./g, "");
          const cleanListingDistCode = (listing.districtCode || "").replace(/\./g, "");
          if (!cleanListingDistCode || cleanListingDistCode !== cleanDistCode) {
            return false;
          }
        }

        // Legacy location fallback when BPS code is not present
        if (!regCode && regId && regId !== "all" && listing.regionId.toLowerCase() !== regId.toLowerCase()) {
          return false;
        }
        if (!distCode && distName && distName !== "all" && listing.district.toLowerCase() !== distName.toLowerCase()) {
          return false;
        }

        // 4. Price range filter
        if (minP !== null && listing.price < minP) return false;
        if (maxP !== null && listing.price > maxP) return false;

        // 5. Condition filter
        if (cond && cond !== "all" && listing.condition.toLowerCase() !== cond.toLowerCase()) {
          return false;
        }

        // 6. BU (Butuh Uang) filter
        if (isBuOnly && !listing.isBu) return false;

        return true;
      })
      .sort((a, b) => {
        if (filterState.isNearest && filterState.nearestDistances) {
          const distCodeA = a.districtCode ? a.districtCode.replace(/\./g, "") : null;
          const distCodeB = b.districtCode ? b.districtCode.replace(/\./g, "") : null;
          const distA: number = (distCodeA && filterState.nearestDistances[distCodeA] != null) ? filterState.nearestDistances[distCodeA]! : 999999;
          const distB: number = (distCodeB && filterState.nearestDistances[distCodeB] != null) ? filterState.nearestDistances[distCodeB]! : 999999;
          if (distA !== distB) return distA - distB;
        }
        if (sort === "price_asc" || sort === "price_low") return a.price - b.price;
        if (sort === "price_desc" || sort === "price_high") return b.price - a.price;
        if (sort === "popular" || sort === "views") return (b.views || 0) - (a.views || 0);
        // Default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .map((item) => {
         if (filterState.isNearest && filterState.nearestDistances) {
             const distCode = item.districtCode ? item.districtCode.replace(/\./g, "") : null;
             if (distCode && filterState.nearestDistances[distCode] !== undefined) {
                 return { ...item, distanceKm: filterState.nearestDistances[distCode] };
             }
         }
         return item;
      });
  }, [domainListings, filterState, effectiveCategory]);

  const updateSearchQuery = useCallback((keyword: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: keyword }));
  }, []);

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState(mapFilterDtoToDomain(null));
  }, []);

  return {
    filterState: { ...filterState, category: effectiveCategory },
    filteredListings,
    totalCount: filteredListings.length,
    updateSearchQuery,
    updateFilter,
    resetFilters,
  };
}
