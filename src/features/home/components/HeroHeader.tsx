import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, PlusCircle, CheckCircle2, MapPin, Tag, Users, GraduationCap } from "lucide-react";

export interface HeroHeaderProps {
  onCreateListingClick?: () => void;
  className?: string;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  onCreateListingClick,
  className = "",
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeRealSlide, setActiveRealSlide] = useState(0);
  const [isHoveredOrTouched, setIsHoveredOrTouched] = useState(false);
  const isTransitioningRef = useRef(false);

  const slidesData = [
    {
      id: "slide-0",
      bg: "from-rose-950 via-rose-900 to-amber-950",
      iconBg: "bg-rose-800/80 border-rose-700/60 text-amber-300",
      Icon: ShieldCheck,
      badgeText: "Pusat Jual Beli Komunitas",
      title: "Cari & Jual Barang Terdekat di Mana Saja",
      desc: "Temukan barang terdekat di mana saja, pantau barangnya, cocokkan barangnya, hubungi penjualnya, bayar langsung ke orangnya.",
      actionIcon: PlusCircle,
      actionText: "Pasang Iklan Gratis",
      actionBg: "bg-amber-400 hover:bg-amber-300 text-slate-950",
      onClick: onCreateListingClick,
      footnote: "⚡ Pantau Cocok Bayar"
    },
    {
      id: "slide-1",
      bg: "from-slate-950 via-slate-900 to-rose-950",
      iconBg: "bg-slate-800 border-slate-700 text-emerald-400",
      Icon: CheckCircle2,
      badgeText: "Panduan Transaksi Amanah",
      title: "Tips Aman Pantau Cocok Bayar (COD)",
      desc: "Utamakan bertemu di tempat terang & ramai. Pastikan selalu cek fungsi & fisik barang secara langsung sebelum melakukan pembayaran!",
      actionIcon: ShieldCheck,
      actionText: "Utamakan Cek Fisik Barang",
      actionBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    },
    {
      id: "slide-2",
      bg: "from-amber-950 via-rose-950 to-slate-950",
      iconBg: "bg-amber-900/60 border-amber-700/50 text-amber-300",
      Icon: MapPin,
      badgeText: "Jangkauan Wilayah Indonesia",
      title: "Belanja Barang Terdekat dari Rumahmu",
      desc: "Gunakan filter wilayah di bawah untuk memantau barang jualan per wilayah dan kecamatan terdekat dari lokasi Anda.",
      actionText: "📍 Cari Wilayah Terdekat • Transaksi Langsung",
      actionBg: "bg-amber-400/20 text-amber-200 border border-amber-400/30",
    },
    {
      id: "slide-3",
      bg: "from-fuchsia-950 via-purple-900 to-indigo-950",
      iconBg: "bg-fuchsia-800/80 border-fuchsia-700/60 text-amber-300",
      Icon: Tag,
      badgeText: "Spesial Untuk Anda",
      title: "Promo Menarik & Diskon Khusus",
      desc: "Pantau terus Sopaloka untuk mendapatkan penawaran eksklusif dari toko-toko terpercaya di sekitar Anda.",
      actionText: "🎉 Cek Promo Hari Ini",
      actionBg: "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30",
    },
    {
      id: "slide-4",
      bg: "from-cyan-950 via-blue-900 to-slate-950",
      iconBg: "bg-cyan-800/80 border-cyan-700/60 text-emerald-300",
      Icon: Users,
      badgeText: "Gabung Komunitas",
      title: "Jadilah Bagian dari Sopaloka",
      desc: "Bergabung bersama ribuan pengguna lainnya. Bangun reputasi toko Anda dan raih lebih banyak pelanggan setia.",
      actionText: "🤝 Gabung Sekarang",
      actionBg: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    },
    {
      id: "slide-5",
      imageUrl: "/image/promo-utbk.png", // The exact image path
      bg: "bg-blue-950",
      iconBg: "bg-blue-800 border-blue-700 text-yellow-300",
      Icon: GraduationCap,
      badgeText: "SMARTEDUCAFE",
      title: "Naikkan Level Ambisimu Bersama SEC!",
      desc: "Maunya kampus impian, tapi usaha sebatas angan-angan? Jujur, janggal! Persiapkan UTBK Anda sekarang. Seat Terbatas!",
      actionIcon: GraduationCap,
      actionText: "Daftar Bimbel UTBK",
      actionBg: "bg-yellow-400 hover:bg-yellow-300 text-blue-950",
      footnote: "🎓 Spesialis Persiapan UTBK"
    }
  ];

  // Efek Rotary: Kloning elemen terakhir ke awal, dan elemen pertama ke akhir.
  const extendedSlides = [
    { ...slidesData[slidesData.length - 1], _key: "clone-last" },
    ...slidesData.map((s) => ({ ...s, _key: s.id })),
    { ...slidesData[0], _key: "clone-first" }
  ];

  const getSlideWidth = () => {
    if (!carouselRef.current) return 0;
    const firstChild = carouselRef.current.children[0] as HTMLElement;
    return firstChild ? firstChild.offsetWidth + 16 : 0; // width + gap-4 (16px)
  };

  useEffect(() => {
    if (carouselRef.current) {
      const slideW = getSlideWidth();
      carouselRef.current.style.scrollBehavior = "auto";
      carouselRef.current.scrollLeft = slideW; // Langsung lompat ke Real Slide 1 (index 1)
      
      const timer = setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.style.scrollBehavior = "smooth";
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!carouselRef.current || isTransitioningRef.current) return;
    const slideW = getSlideWidth();
    carouselRef.current.scrollBy({ left: slideW, behavior: "smooth" });
  }, []);

  const handlePrev = useCallback(() => {
    if (!carouselRef.current || isTransitioningRef.current) return;
    const slideW = getSlideWidth();
    carouselRef.current.scrollBy({ left: -slideW, behavior: "smooth" });
  }, []);

  const handleDotClick = (index: number) => {
    if (!carouselRef.current || isTransitioningRef.current) return;
    const slideW = getSlideWidth();
    const targetPhysicalIndex = index + 1; // +1 karena ada clone di index 0
    carouselRef.current.scrollTo({ left: slideW * targetPhysicalIndex, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const slideW = getSlideWidth();
    if (slideW === 0) return;

    const scrollLeft = carouselRef.current.scrollLeft;
    const physicalIndex = Math.round(scrollLeft / slideW);
    
    // Perbarui active dot
    if (physicalIndex === 0) {
      setActiveRealSlide(slidesData.length - 1);
    } else if (physicalIndex === extendedSlides.length - 1) {
      setActiveRealSlide(0);
    } else {
      setActiveRealSlide(physicalIndex - 1);
    }

    // Logika Infinite Loop Teleportation (Rotary)
    if (physicalIndex === 0) {
      // Sampai di clone paling kiri (Clone 5), teleport ke Real 5
      if (!isTransitioningRef.current) {
        isTransitioningRef.current = true;
        setTimeout(() => {
          if (carouselRef.current) {
            carouselRef.current.style.scrollBehavior = "auto";
            carouselRef.current.scrollLeft = slideW * slidesData.length;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (carouselRef.current) carouselRef.current.style.scrollBehavior = "smooth";
                isTransitioningRef.current = false;
              });
            });
          }
        }, 400); // Tunggu sampai animasi snap selesai
      }
    } else if (physicalIndex === extendedSlides.length - 1) {
      // Sampai di clone paling kanan (Clone 1), teleport ke Real 1
      if (!isTransitioningRef.current) {
        isTransitioningRef.current = true;
        setTimeout(() => {
          if (carouselRef.current) {
            carouselRef.current.style.scrollBehavior = "auto";
            carouselRef.current.scrollLeft = slideW * 1;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                if (carouselRef.current) carouselRef.current.style.scrollBehavior = "smooth";
                isTransitioningRef.current = false;
              });
            });
          }
        }, 400);
      }
    }
  };

  useEffect(() => {
    if (isHoveredOrTouched) return;
    const intervalId = setInterval(() => {
      handleNext();
    }, 4500); // 4.5 detik
    return () => clearInterval(intervalId);
  }, [isHoveredOrTouched, handleNext]);

  return (
    <section id="hero-banner-section" className={`relative overflow-hidden group mt-0 pt-0 pb-0 mb-0 w-full ${className}`.trim()}>
      <button
        type="button"
        onClick={handlePrev}
        className="hidden sm:flex absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-sm items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer opacity-70 hover:opacity-100"
        title="Banner Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="hidden sm:flex absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white backdrop-blur-sm items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer opacity-70 hover:opacity-100"
        title="Banner Selanjutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div
        id="hero-banner-carousel"
        ref={carouselRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsHoveredOrTouched(true)}
        onTouchEnd={() => setIsHoveredOrTouched(false)}
        onMouseEnter={() => setIsHoveredOrTouched(true)}
        onMouseLeave={() => setIsHoveredOrTouched(false)}
        className="relative z-10 flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-2 px-[calc(50%-85px)] sm:px-[calc(50%-110px)] pt-0 pb-0 scroll-smooth w-full items-center"
      >
        {extendedSlides.map((slide, idx) => {
          const SIcon = slide.Icon;
          const SActionIcon = slide.actionIcon;

          return (
            <div
              key={slide._key}
              data-slide={idx}
              className={`hero-carousel-slide snap-center flex-none w-[170px] sm:w-[220px] aspect-[4/5] overflow-hidden rounded-xl relative ${slide.imageUrl ? slide.bg : `bg-gradient-to-br ${slide.bg}`} text-white shadow-md flex flex-col justify-between select-none`}
            >
              {/* If imageUrl exists, render the full image instead of text */}
              {(slide as any).imageUrl ? (
                <img 
                  src={(slide as any).imageUrl} 
                  alt={slide.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="p-3 sm:p-4 flex flex-col justify-between gap-1 w-full h-full">
                    <div className="relative z-10 space-y-1 sm:space-y-1.5">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] sm:text-[10px] font-bold shadow-xs ${slide.iconBg}`}>
                        <SIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{slide.badgeText}</span>
                      </div>
                      <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight line-clamp-2">
                        {slide.title}
                      </h2>
                      <p className="text-[9px] sm:text-[10px] text-white/80 leading-tight font-medium opacity-90 line-clamp-3">
                        {slide.desc}
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-2 pt-1">
                      {slide.onClick ? (
                        <button
                          type="button"
                          onClick={slide.onClick}
                          className={`px-2 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black flex items-center gap-1 shadow-xs transition-transform hover:scale-105 cursor-pointer ${slide.actionBg}`}
                        >
                          {SActionIcon && <SActionIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                          <span>{slide.actionText}</span>
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black ${slide.actionBg}`}>
                          {SActionIcon && <SActionIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                          <span>{slide.actionText}</span>
                        </span>
                      )}
                      {slide.footnote && (
                        <span className="text-[8px] sm:text-[9px] font-bold hidden sm:inline line-clamp-1 opacity-80">
                          {slide.footnote}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div
        id="hero-carousel-dots"
        className="relative z-10 flex items-center justify-center gap-1.5 mt-2 mb-0 h-auto py-0 leading-none"
      >
        {slidesData.map((_, idx) => (
          <span
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`hero-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeRealSlide === idx
                ? "bg-rose-700 scale-110 shadow-xs"
                : "bg-rose-300/60 scale-100 hover:bg-rose-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
