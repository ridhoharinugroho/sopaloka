/**
 * Data Wilayah Indonesia & Kontrak Lokasi Nasional SOPALOKA (TypeScript)
 */

export interface Region {
  id: string;
  code: string;
  provinceCode: string;
  name: string;
  shortName?: string;
  badgeColor?: string;
  accentColor?: string;
  popularSpots?: string[];
  districts?: string[];
}

export interface Province {
  id: string;
  code: string;
  name: string;
}

export interface FormattedRegency extends Region {
  rawCode: string;
}

export interface FormattedDistrict {
  code: string;
  name: string;
}

import regionsData from "../data/regions.json";

export const PROVINCES: Province[] = regionsData.provinces;
export const REGIONS: Region[] = regionsData.regencies;

export const SOLO_RAYA_REGIONS = REGIONS;

export function getRegionById(id?: string | null): Region | null {
  if (!id) return null;
  const cleanId = String(id).trim().toLowerCase();
  const found = REGIONS.find((r) => r.id.toLowerCase() === cleanId || r.code === cleanId);
  if (found) return found;

  const formattedName = cleanId
    .split(/[-_ ]+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");

  return {
    id: cleanId,
    code: "",
    provinceCode: "",
    name: formattedName,
    shortName: formattedName,
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    accentColor: "#475569",
    popularSpots: [],
    districts: [],
  };
}

export function getDistrictsByRegionId(regionId?: string | null): string[] {
  const region = getRegionById(regionId);
  return region ? region.districts || [] : [];
}

export function getProvinces(): Province[] {
  return PROVINCES;
}

export function getRegenciesByProvince(provCode?: string | null): FormattedRegency[] {
  if (!provCode) return [];
  const cleanProv = String(provCode).trim().replace(/\./g, "");
  const matched = cleanProv === "all" 
    ? REGIONS 
    : REGIONS.filter((r) => !r.provinceCode || r.provinceCode.replace(/\./g, "") === cleanProv);
  return matched.map((r) => {
    const rawCode = String(r.code || "").replace(/\./g, "");
    const formattedCode = rawCode.length === 4 ? `${rawCode.slice(0, 2)}.${rawCode.slice(2)}` : r.code;
    return {
      ...r,
      code: formattedCode,
      rawCode: rawCode,
    };
  });
}

export function getDistrictsByRegency(regencyCode?: string | null): FormattedDistrict[] {
  if (!regencyCode) return [];
  const cleanReg = String(regencyCode).trim().toLowerCase().replace(/\./g, "");
  const region = REGIONS.find(
    (r) =>
      r.id.toLowerCase() === cleanReg ||
      String(r.code || "").toLowerCase().replace(/\./g, "") === cleanReg,
  );
  if (!region || !Array.isArray(region.districts)) return [];
  
  const baseRegCode = String(region.code || "").replace(/\./g, "");
  const formattedRegCode = baseRegCode.length === 4 ? `${baseRegCode.slice(0, 2)}.${baseRegCode.slice(2)}` : baseRegCode;

  return region.districts.map((d, index) => {
    const idxStr = String(index + 1).padStart(2, "0");
    const distName = typeof d === "string" ? d : (d as any).name || String(d);
    return {
      code: `${formattedRegCode}.${idxStr}`,
      name: distName,
    };
  });
}
