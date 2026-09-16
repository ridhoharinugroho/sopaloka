import React, { useEffect, useState, useMemo } from "react";
import { PROVINCES, getRegenciesByProvince, getDistrictsFromDB, type FormattedDistrict } from "../../../lib/regions";

export interface LocationPickerProps {
  provinceCode?: string | null;
  regencyCode?: string | null;
  districtCode?: string | null;
  regionId?: string | null;
  showDistrict?: boolean;
  onProvinceChange?: (provCode: string) => void;
  onRegencyChange?: (regCode: string) => void;
  onDistrictChange?: (code: string, name: string) => void;
  onRegionIdChange?: (regionId: string) => void;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  provinceCode = "",
  regencyCode = "",
  districtCode = "",
  regionId = "all",
  showDistrict = false,
  onProvinceChange,
  onRegencyChange,
  onDistrictChange,
  onRegionIdChange,
  className = "",
}) => {
  const [districts, setDistricts] = useState<FormattedDistrict[]>([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  const regencies = useMemo(() => {
    return provinceCode ? getRegenciesByProvince(provinceCode) : [];
  }, [provinceCode]);

  useEffect(() => {
    if (showDistrict && regencyCode) {
      setIsLoadingDistricts(true);
      getDistrictsFromDB(regencyCode).then((data) => {
        setDistricts(data);
        setIsLoadingDistricts(false);
      });
    } else {
      setDistricts([]);
    }
  }, [regencyCode, showDistrict]);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {/* Province Picker (BPS) */}
      <select
        value={provinceCode || ""}
        onChange={(e) => {
          const val = e.target.value;
          onProvinceChange?.(val);
          onRegencyChange?.("");
          if (showDistrict) onDistrictChange?.("", "");
        }}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">Semua Provinsi</option>
        {PROVINCES.map((prov) => (
          <option key={prov.code} value={prov.code}>
            {prov.name}
          </option>
        ))}
      </select>

      {/* Regency / City Picker (BPS) */}
      {provinceCode && (
        <select
          value={regencyCode || ""}
          onChange={(e) => {
            onRegencyChange?.(e.target.value);
            if (showDistrict) onDistrictChange?.("", "");
          }}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Semua Kab/Kota</option>
          {regencies.map((reg) => (
            <option key={reg.code} value={reg.code}>
              {reg.name}
            </option>
          ))}
        </select>
      )}

      {/* District Picker (BPS) */}
      {showDistrict && provinceCode && regencyCode && (
        <select
          value={districtCode || ""}
          onChange={(e) => {
            const val = e.target.value;
            const name = districts.find(d => d.code === val)?.name || "";
            onDistrictChange?.(val, name);
          }}
          disabled={isLoadingDistricts}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">{isLoadingDistricts ? "Memuat..." : "Semua Kecamatan"}</option>
          {districts.map((dist) => (
            <option key={dist.code} value={dist.code}>
              {dist.name}
            </option>
          ))}
        </select>
      )}

      {/* Legacy Region Fallback Select */}
      {!provinceCode && (
        <select
          value={regionId || "all"}
          onChange={(e) => onRegionIdChange?.(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">Semua Wilayah</option>
          <option value="solo">Kota Solo</option>
          <option value="karanganyar">Karanganyar</option>
          <option value="sukoharjo">Sukoharjo</option>
          <option value="sragen">Sragen</option>
          <option value="boyolali">Boyolali</option>
          <option value="klaten">Klaten</option>
          <option value="wonogiri">Wonogiri</option>
        </select>
      )}
    </div>
  );
};
