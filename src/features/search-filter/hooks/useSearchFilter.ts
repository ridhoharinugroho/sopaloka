import { useState, useMemo, useCallback, useEffect } from "react";
import Fuse from "fuse.js";
import type { ListingModel } from "../../../domain/listing/listing.contract";
import type { FilterState } from "../../../domain/filter/filter.contract";
import { mapListingDtoToDomain } from "../../../domain/listing/listing.mapper";
import { mapFilterDtoToDomain } from "../../../domain/filter/filter.mapper";
import type { SupabaseListingRowDTO } from "../../../domain/listing/listing.dto";

import { cleanLocationName, getSearchSynonymsCache, fetchSynonymsFromSupabase } from "../../../services/listingService";

export interface UseSearchFilterProps {
  initialListings?: SupabaseListingRowDTO[] | ListingModel[];
  category?: string;
}

function resolveItemDistance(
  distCode?: string | null,
  districtName?: string | null,
  nearestMap?: Record<string, number> | null
): number | undefined {
  if (!nearestMap) return undefined;
  
  // 1. Match by districtCode (most accurate)
  if (distCode) {
    const cleanCode = distCode.replace(/\./g, "");
    if (nearestMap[cleanCode] != null) return nearestMap[cleanCode];
  }
  
  if (!districtName) return undefined;
  
  const lowerName = districtName.toLowerCase().trim();
  // 2. Exact name match
  if (nearestMap[lowerName] != null) return nearestMap[lowerName];
  
  // 3. Clean name match (strips kota, kecamatan, etc.)
  const cleanName = cleanLocationName(districtName);
  if (cleanName && nearestMap[cleanName] != null) return nearestMap[cleanName];
  
  // 4. Substring inclusion fallback
  for (const [key, val] of Object.entries(nearestMap)) {
    if (key.length >= 4 && (lowerName.includes(key) || key.includes(lowerName) || (cleanName && (cleanName.includes(key) || key.includes(cleanName))))) {
      return val;
    }
  }
  
  return undefined;
}

function getLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function isWordMatch(token: string, target: string): boolean {
  if (token === target) return true;
  // Prefix matching for query terms with length >= 4 (e.g. 'kulk' -> 'kulkas')
  if (target.length >= 4 && token.startsWith(target)) return true;

  const lenDiff = Math.abs(token.length - target.length);
  // Guard against disparate length words (prevents 'pembuangan' [10] matching 'angin' [5])
  if (target.length <= 3) {
    return false; // Very short tokens (<=3 chars) require exact match
  }
  if (target.length <= 5 && lenDiff > 1) {
    return false;
  }
  if (target.length > 5 && lenDiff > 2) {
    return false;
  }

  const maxDistance = target.length <= 4 ? 1 : 1;
  return getLevenshteinDistance(token, target) <= maxDistance;
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

  // Reactive synonyms state loaded with master defaults and synced with Supabase
  const [synonymsCache, setSynonymsCache] = useState<Record<string, string[]>>(() => getSearchSynonymsCache());

  useEffect(() => {
    // 1. Fetch live synonyms from Supabase
    fetchSynonymsFromSupabase().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setSynonymsCache(data);
      }
    });

    // 2. React to dynamic updates
    const handleSynonymsUpdate = (e: any) => {
      if (e?.detail) setSynonymsCache(e.detail);
      else setSynonymsCache(getSearchSynonymsCache());
    };

    window.addEventListener("sopaloka:synonyms_updated", handleSynonymsUpdate as EventListener);
    return () => {
      window.removeEventListener("sopaloka:synonyms_updated", handleSynonymsUpdate as EventListener);
    };
  }, []);

  // Sync external search query (from HeaderNav)
  useEffect(() => {
    const handleSearchEvent = (e: CustomEvent<string>) => {
      setFilterState((prev) => ({
        ...prev,
        searchQuery: e.detail,
      }));
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.addEventListener("sopaloka:search_submitted", handleSearchEvent as EventListener);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.removeEventListener("sopaloka:search_submitted", handleSearchEvent as EventListener);
    };
  }, []);

  // Normalize input listings into canonical ListingModel domain models
  const domainListings = useMemo(() => {
    return initialListings.map((item) =>
      "negoType" in item ? (item as ListingModel) : mapListingDtoToDomain(item as SupabaseListingRowDTO)
    );
  }, [initialListings]);

  // Pure filtering logic
  const filteredListings = useMemo(() => {
    const q = filterState.searchQuery.trim(); // Fuse doesn't need toLowerCase()
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

    // 1. Apply hard filters first (Category, Location, Price, Condition)
    let results = domainListings.filter((listing) => {
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
      });

    // Type definition for results with tier
    type TieredListing = typeof domainListings[0] & { tier?: number };
    let tieredResults: TieredListing[] = results;

    // 2. Apply Fuzzy Search if query exists
    if (q) {
      const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
      
      // Ambil sinonim dari state reaktif untuk setiap kata
      const expandedWordGroups = words.map(word => {
        const syns = synonymsCache[word] || [];
        return Array.from(new Set([word, ...syns])); // Array kata beserta semua sinonimnya tanpa duplikasi
      });
      
      const matchedResults: TieredListing[] = [];

      for (const item of results) {
        let maxTierForThisItem = 1; // Mulai dengan asumsi tier 1 (terbaik)
        let isItemPass = true;

        // Tokenize text per item
        const titleTokens = item.title ? item.title.toLowerCase().split(/\s+/).filter(Boolean) : [];
        const catTokens = item.category ? item.category.toLowerCase().split(/\s+/).filter(Boolean) : [];
        const descTokens = item.description ? item.description.toLowerCase().split(/\s+/).filter(Boolean) : [];

        // Evaluasi logika AND dengan word-boundary & length constraint: Setiap token (atau sinonimnya) WAJIB cocok
        for (const wordGroup of expandedWordGroups) {
          const foundInTitle = wordGroup.some(target => titleTokens.some(tok => isWordMatch(tok, target)));
          if (foundInTitle) continue; // Masih Tier 1

          const foundInCat = wordGroup.some(target => catTokens.some(tok => isWordMatch(tok, target)));
          if (foundInCat) {
             if (maxTierForThisItem < 2) maxTierForThisItem = 2; // Turun ke Tier 2 karena butuh bantuan kategori
             continue;
          }

          const foundInDesc = wordGroup.some(target => descTokens.some(tok => isWordMatch(tok, target)));
          if (foundInDesc) {
             if (maxTierForThisItem < 3) maxTierForThisItem = 3; // Turun ke Tier 3 karena terpaksa pakai deskripsi
             continue;
          }

          // Gagal ditemukan di Judul, Kategori, maupun Deskripsi -> DIBUANG
          isItemPass = false;
          break;
        }

        if (isItemPass) {
          matchedResults.push({ ...item, tier: maxTierForThisItem });
        }
      }

      tieredResults = matchedResults;
    }

    // 3. Sort results
    return tieredResults.sort((a, b) => {
        // 1. Prioritaskan Tier terlebih dahulu (1 paling atas, 3 paling bawah)
        const tierA = a.tier ?? 0;
        const tierB = b.tier ?? 0;
        if (tierA !== tierB) {
            return tierA - tierB;
        }

        // 2. Jika Tier sama, jalankan sort eksisting (Jarak, Harga, Terbaru, dll)
        if (filterState.isNearest && filterState.nearestDistances) {
          const nm = filterState.nearestDistances;
          const distA = resolveItemDistance(a.districtCode, a.district, nm) ?? 999999;
          const distB = resolveItemDistance(b.districtCode, b.district, nm) ?? 999999;
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
             const km = resolveItemDistance(item.districtCode, item.district, filterState.nearestDistances);
             if (km !== undefined) return { ...item, distanceKm: km };
         }
         return item;
      });
  }, [domainListings, filterState, effectiveCategory, synonymsCache]);

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
