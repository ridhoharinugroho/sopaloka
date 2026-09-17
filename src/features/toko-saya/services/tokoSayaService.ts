import { getMyListings, fetchSellerListingsFromSupabase } from "../../../services/listingService";
import { mapListingDtoToDomain } from "../../../domain/listing/listing.mapper";
import type { ListingModel } from "../../../domain/listing/listing.contract";
import type { SupabaseListingRowDTO } from "../../../domain/listing/listing.dto";

export async function fetchTokoListings(sellerId?: string): Promise<ListingModel[]> {
  try {
    const rawData = await fetchSellerListingsFromSupabase(sellerId);
    if (Array.isArray(rawData) && rawData.length > 0) {
      return rawData.map((row: SupabaseListingRowDTO) => mapListingDtoToDomain(row));
    }
    const fallback = getMyListings(sellerId);
    if (!fallback || !Array.isArray(fallback)) return [];
    return fallback.map((row: SupabaseListingRowDTO) => mapListingDtoToDomain(row));
  } catch (error) {
    console.error("[TokoSayaService] fetchTokoListings error:", error);
    return [];
  }
}
