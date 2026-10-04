"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Sparkles,
  Camera,
  Maximize2,
  Minimize2,
  Download,
  Columns,
  Sliders,
  Check,
  Palette,
  Eye,
  RotateCcw,
} from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  roomTitle?: string;
  styleName?: string;
  onDownload?: () => void;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  roomTitle = "Không Gian Phòng Khách",
  styleName = "Modern Italian Luxury",
  onDownload,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"slider" | "split">("slider");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTone, setActiveTone] = useState<string>("cognac");

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percent);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleDownloadImage = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const a = document.createElement("a");
    a.href = afterImage;
    a.download = `GS-Luxury-Staged-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-gold/40 shadow-2xl bg-charcoal transition-all ${
        isFullscreen
          ? "fixed inset-4 z-50 rounded-2xl max-w-none max-h-none h-[calc(100vh-2rem)]"
          : "aspect-[16/9] min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]"
      }`}
    >
      {/* Top Floating Glass HUD Bar */}
      <div className="absolute top-4 inset-x-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-3 py-1.5 rounded-full bg-charcoal/80 backdrop-blur-md border border-gold/40 text-gold text-xs font-mono font-semibold flex items-center gap-1.5 shadow-lg">
            <Sparkles size={13} className="text-gold animate-pulse" />
            <span>AI Virtual Staging Studio</span>
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-beige/80 text-[11px] font-mono">
            {styleName}
          </span>
        </div>

        {/* View mode & fullscreen actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-charcoal/80 backdrop-blur-md border border-white/10 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode("slider")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "slider"
                  ? "bg-gold text-charcoal shadow-sm"
                  : "text-beige/60 hover:text-beige hover:bg-white/5"
              }`}
              title="Kéo thanh trượt so sánh"
            >
              <Sliders size={12} />
              <span className="hidden md:inline">Thanh Trượt</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "split"
                  ? "bg-gold text-charcoal shadow-sm"
                  : "text-beige/60 hover:text-beige hover:bg-white/5"
              }`}
              title="Xem tách đôi song song"
            >
              <Columns size={12} />
              <span className="hidden md:inline">Tách Đôi</span>
            </button>
          </div>

          <button
            onClick={handleDownloadImage}
            className="p-2 rounded-xl bg-charcoal/80 backdrop-blur-md border border-white/15 text-beige/80 hover:text-gold hover:border-gold/40 transition-colors shadow-lg"
            title="Tải ảnh phối cảnh HD"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-charcoal/80 backdrop-blur-md border border-white/15 text-beige/80 hover:text-gold hover:border-gold/40 transition-colors shadow-lg"
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: SPLIT SCREEN (SIDE BY SIDE) */}
      {viewMode === "split" ? (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/15 relative">
          {/* Left: Before */}
          <div className="relative w-full h-full min-h-[220px]">
            <Image
              src={beforeImage}
              alt="Hiện trạng phòng thực tế"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono text-beige/90 flex items-center gap-1.5">
              <Camera size={13} className="text-white/60" />
              <span>[TRƯỚC] Hiện trạng phòng thực tế</span>
            </div>
          </div>

          {/* Right: After */}
          <div className="relative w-full h-full min-h-[220px]">
            <Image
              src={afterImage}
              alt="Phối cảnh nội thất GS Luxury"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-gold/90 backdrop-blur-md border border-gold text-[11px] font-mono text-charcoal font-semibold flex items-center gap-1.5 shadow-lg">
              <Sparkles size={13} className="text-charcoal" />
              <span>[SAU] Phối Cảnh Hoàn Thiện GS Luxury</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: INTERACTIVE DRAGGABLE BEFORE/AFTER SLIDER */
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          className="relative w-full h-full select-none cursor-ew-resize overflow-hidden"
        >
          {/* 1. Underlying Layer: AFTER (Furnished Luxury Staged Room) */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={afterImage}
              alt="Phối cảnh nội thất hoàn thiện GS Luxury"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* 2. Overlying Layer: BEFORE (Clipped using polygon width) */}
          <div
            className="absolute inset-0 w-full h-full overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            }}
          >
            <Image
              src={beforeImage}
              alt="Hiện trạng phòng thực tế"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>

          {/* 3. Divider Line & Interactive Handle */}
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Golden Vertical Laser Beam */}
            <div className="absolute -left-[1.5px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold via-[#FFF2B2] to-gold shadow-[0_0_15px_rgba(212,175,55,0.8)]" />

            {/* Draggable Circle Knob */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-charcoal/90 backdrop-blur-md border-2 border-gold shadow-2xl flex items-center justify-center text-gold group hover:scale-110 active:scale-95 transition-transform pointer-events-auto cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
                <span>◄</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                <span>►</span>
              </div>
            </div>
          </div>

          {/* Floating Badges inside Canvas */}
          <div className="absolute bottom-5 left-5 z-20 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-xs font-mono text-beige/90 flex items-center gap-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span>[TRƯỚC] Phòng thực tế</span>
            </div>
          </div>

          <div className="absolute bottom-5 right-5 z-20 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-gold/90 backdrop-blur-md border border-gold text-xs font-mono text-charcoal font-semibold flex items-center gap-2 shadow-xl">
              <Sparkles size={13} className="text-charcoal" />
              <span>[SAU] Đã lên đồ GS Luxury</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interactive Quick-Palette Bar */}
      <div className="absolute bottom-4 inset-x-0 z-30 flex items-center justify-center pointer-events-none">
        <div className="px-4 py-2 rounded-2xl bg-charcoal/90 backdrop-blur-xl border border-gold/30 shadow-2xl flex items-center gap-3 pointer-events-auto">
          <span className="text-[11px] font-mono text-beige/60 uppercase tracking-wider hidden sm:inline flex items-center gap-1.5">
            <Palette size={12} className="text-gold" />
            <span>Tone Nội Thất:</span>
          </span>

          <div className="flex items-center gap-2">
            {[
              { id: "cognac", label: "Da Bò Cognac", color: "#8B4513" },
              { id: "boucle", label: "Kem Bouclé", color: "#E8E2D6" },
              { id: "walnut", label: "Gỗ Óc Chó", color: "#3E2723" },
            ].map((tone) => (
              <button
                key={tone.id}
                onClick={() => setActiveTone(tone.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeTone === tone.id
                    ? "bg-gold text-charcoal font-semibold shadow-sm scale-105"
                    : "text-beige/70 hover:text-beige hover:bg-white/10"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/30"
                  style={{ backgroundColor: tone.color }}
                />
                <span>{tone.label}</span>
              </button>
            ))}
          </div>

          <span className="text-[10px] text-emerald-400 font-mono hidden md:inline ml-2 pl-3 border-l border-white/10">
            ✓ Giữ nguyên 100% sàn &amp; hướng sáng
          </span>
        </div>
      </div>
    </div>
  );
}
