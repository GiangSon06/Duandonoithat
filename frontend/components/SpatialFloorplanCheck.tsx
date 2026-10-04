"use client";

import { useState } from "react";
import {
  Ruler,
  CheckCircle2,
  AlertCircle,
  Eye,
  Info,
  Maximize2,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface SpatialFloorplanCheckProps {
  roomArea?: number | string;
  roomWidth?: number; // meters (e.g. 4.4)
  roomLength?: number; // meters (e.g. 7.2)
  sofaName?: string;
  sofaDimensions?: string;
  tableDimensions?: string;
  balconyClearance?: number; // cm (e.g. 115)
  mainDoorClearance?: number; // cm (e.g. 135)
  coveragePercent?: number; // e.g. 24.5
}

export default function SpatialFloorplanCheck({
  roomArea = 35,
  roomWidth = 4.4,
  roomLength = 7.2,
  sofaName = "Sofa Modular Riviera 3 Chỗ",
  sofaDimensions = "280 x 105 x 82 cm",
  tableDimensions = "120 x 70 x 42 cm",
  balconyClearance = 115,
  mainDoorClearance = 135,
  coveragePercent = 24.5,
}: SpatialFloorplanCheckProps) {
  const [activeTab, setActiveTab] = useState<"blueprint" | "metrics">("blueprint");
  const [highlightZone, setHighlightZone] = useState<string | null>(null);

  return (
    <div className="bg-charcoal/90 border border-gold/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background blueprint grid watermark */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #D4AF37 1px, transparent 1px), linear-gradient(to bottom, #D4AF37 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest2 text-emerald-400 font-semibold">
              Kiểm Tra An Toàn Kích Thước &amp; Lưu Thông
            </span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-champagne font-normal">
            Sơ Đồ Mặt Bằng 2D &amp; Đo Đạc Khoảng Trống
          </h3>
          <p className="text-xs text-beige/65 mt-1">
            Đảm bảo nội thất kê vừa vặn, không chắn lối đi, giữ nguyên luồng sinh khí phong thủy
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono self-start sm:self-auto">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Đạt Chuẩn Lưu Thông Châu Âu</span>
        </div>
      </div>

      {/* 3 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
        {/* Metric 1: Balcony Clearance */}
        <div
          onMouseEnter={() => setHighlightZone("balcony")}
          onMouseLeave={() => setHighlightZone(null)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            highlightZone === "balcony"
              ? "bg-emerald-500/15 border-emerald-400 shadow-lg scale-[1.02]"
              : "bg-white/5 border-white/10 hover:border-emerald-400/40"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-beige/60 mb-2">
            <span>Lối Đi Ra Ban Công</span>
            <span className="text-emerald-400 font-semibold">Tiêu Chuẩn &gt; 80cm</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl lg:text-3xl text-emerald-400 font-bold">
              {balconyClearance} cm
            </span>
            <span className="text-[11px] text-emerald-300 font-mono">Dư 35cm</span>
          </div>
          <p className="text-[11px] text-beige/60 mt-1">
            Lối đi rộng rãi, mở cửa đón gió và lấy đồ ban công cực kỳ êm ái
          </p>
        </div>

        {/* Metric 2: Floor Occupancy */}
        <div
          onMouseEnter={() => setHighlightZone("sofa")}
          onMouseLeave={() => setHighlightZone(null)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            highlightZone === "sofa"
              ? "bg-gold/15 border-gold shadow-lg scale-[1.02]"
              : "bg-white/5 border-white/10 hover:border-gold/40"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-beige/60 mb-2">
            <span>Tỷ Lệ Chiếm Dụng Sàn</span>
            <span className="text-gold font-semibold">Lý Tưởng: 20 - 30%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl lg:text-3xl text-gold font-bold">
              {coveragePercent}%
            </span>
            <span className="text-[11px] text-gold/80 font-mono">
              (~{(Number(roomArea) * (coveragePercent / 100)).toFixed(1)} m²)
            </span>
          </div>
          <p className="text-[11px] text-beige/60 mt-1">
            Không gian thoáng đãng, không gây cảm giác chật chội hay ngột ngạt
          </p>
        </div>

        {/* Metric 3: Ergonomic Viewing Distance */}
        <div
          onMouseEnter={() => setHighlightZone("tv")}
          onMouseLeave={() => setHighlightZone(null)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            highlightZone === "tv"
              ? "bg-blue-500/15 border-blue-400 shadow-lg scale-[1.02]"
              : "bg-white/5 border-white/10 hover:border-blue-400/40"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-beige/60 mb-2">
            <span>Khoảng Cách Đến Kệ TV</span>
            <span className="text-blue-400 font-semibold">Chuẩn Ergonomics</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl lg:text-3xl text-champagne font-bold">
              3.35 m
            </span>
            <span className="text-[11px] text-blue-300 font-mono">Màn 65 - 75&quot;</span>
          </div>
          <p className="text-[11px] text-beige/60 mt-1">
            Góc nhìn thư giãn, bảo vệ mắt người lớn và trẻ nhỏ tối đa
          </p>
        </div>
      </div>

      {/* Interactive 2D Floorplan Vector Canvas */}
      <div className="relative rounded-2xl border border-white/15 bg-[#141210] p-4 sm:p-6 overflow-hidden">
        {/* Blueprint Title & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-gold font-semibold flex items-center gap-1.5">
              <Ruler size={14} /> Sơ Đồ Kê Đồ 2D (Tỷ Lệ 1:50)
            </span>
            <span className="text-beige/40">•</span>
            <span className="text-beige/60">
              Kích thước phòng: {roomWidth}m × {roomLength}m (~{roomArea}m²)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-gold">
              <span className="w-2.5 h-2.5 rounded-sm bg-gold" /> Sofa &amp; Bàn
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-1.5 bg-emerald-400 rounded-full" /> Lối Đi Thoáng
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-1.5 border-b-2 border-dashed border-amber-400" /> Vách Kính
            </span>
          </div>
        </div>

        {/* SVG Architectural Canvas */}
        <div className="relative w-full aspect-[16/9] min-h-[280px] sm:min-h-[340px] max-h-[460px] bg-[#0C0B0A] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center p-2 sm:p-4">
          <svg
            viewBox="0 0 800 450"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Rug Grid Pattern */}
              <pattern
                id="rugPattern"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 12 0 L 0 12 M 0 0 L 12 12"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="0.5"
                  opacity="0.25"
                />
              </pattern>

              {/* Sunlight Gradient for Balcony */}
              <linearGradient id="sunlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </linearGradient>

              {/* Safe Green Pulse Glow */}
              <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#34D399" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Room Boundary Walls */}
            <rect
              x="50"
              y="40"
              width="700"
              height="370"
              fill="#12100E"
              stroke="#D4AF37"
              strokeWidth="3"
              rx="6"
            />

            {/* Wall Dimension Labels */}
            {/* Top Wall Length */}
            <text x="400" y="28" fill="#D4AF37" fontSize="11" fontFamily="monospace" textAnchor="middle">
              ◄ Chiều Dài Phòng: {roomLength}0 m ►
            </text>
            {/* Left Wall Width */}
            <text
              x="-225"
              y="32"
              fill="#D4AF37"
              fontSize="11"
              fontFamily="monospace"
              textAnchor="middle"
              transform="rotate(-90)"
            >
              ◄ Chiều Rộng Tường: {roomWidth}0 m ►
            </text>

            {/* BALCONY GLASS DOOR (Right Wall) */}
            <line x1="750" y1="120" x2="750" y2="330" stroke="#FDE68A" strokeWidth="6" />
            <polygon points="750,120 750,330 630,300 630,150" fill="url(#sunlight)" />
            <text x="735" y="230" fill="#FDE68A" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 735 230)">
              ☀ CỬA KÍNH BAN CÔNG ĐÓN NẮNG
            </text>

            {/* MAIN ENTRANCE DOOR (Bottom Left Wall) */}
            <line x1="120" y1="410" x2="190" y2="410" stroke="#F87171" strokeWidth="5" />
            <path d="M 120 410 A 70 70 0 0 1 190 340" fill="none" stroke="#F87171" strokeWidth="1" strokeDasharray="3 3" />
            <text x="155" y="425" fill="#F87171" fontSize="10" fontFamily="monospace" textAnchor="middle">
              Cửa Vào Nhà
            </text>

            {/* RUG AREA (Centered under sofa) */}
            <rect
              x="260"
              y="110"
              width="360"
              height="230"
              fill="url(#rugPattern)"
              stroke="#D4AF37"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              rx="8"
            />
            <text x="440" y="130" fill="#D4AF37" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.6">
              Thảm Lông Cừu Dệt Tay (3.0m × 2.0m)
            </text>

            {/* SOFA SECTIONAL MODULAR (Main Focal Point) */}
            <g
              className="transition-transform duration-300"
              style={{
                filter: highlightZone === "sofa" ? "drop-shadow(0 0 8px #D4AF37)" : "none",
              }}
            >
              {/* Curved / L-shape sofa body */}
              <rect
                x="280"
                y="150"
                width="290"
                height="100"
                fill="#8B4513"
                stroke="#D4AF37"
                strokeWidth="2"
                rx="14"
              />
              {/* Backrest cushioning */}
              <rect x="285" y="155" width="280" height="28" fill="#5C2D0C" rx="8" />
              <text x="425" y="205" fill="#FFF2B2" fontSize="11" fontFamily="serif" fontWeight="bold" textAnchor="middle">
                {sofaName}
              </text>
              <text x="425" y="222" fill="#E6C687" fontSize="9" fontFamily="monospace" textAnchor="middle">
                Kích thước: {sofaDimensions}
              </text>
            </g>

            {/* COFFEE TABLE (Marble Top) */}
            <rect
              x="365"
              y="265"
              width="120"
              height="60"
              fill="#1F2937"
              stroke="#D4AF37"
              strokeWidth="2"
              rx="12"
            />
            <text x="425" y="295" fill="#FFF2B2" fontSize="9" fontFamily="monospace" textAnchor="middle">
              Bàn Trà Marble
            </text>
            <text x="425" y="310" fill="#9CA3AF" fontSize="8" fontFamily="monospace" textAnchor="middle">
              {tableDimensions}
            </text>

            {/* TV CONSOLE UNIT & WALL ART (Top Wall) */}
            <g
              style={{
                filter: highlightZone === "tv" ? "drop-shadow(0 0 8px #60A5FA)" : "none",
              }}
            >
              <rect x="310" y="44" width="230" height="26" fill="#292524" stroke="#78716C" strokeWidth="1.5" rx="3" />
              <text x="425" y="61" fill="#E7E5E4" fontSize="9" fontFamily="monospace" textAnchor="middle">
                Kệ TV Treo &amp; Vách Ốp Đá Lam Gỗ (2.4m)
              </text>
            </g>

            {/* LOUNGE ARMCHAIR (Left of rug) */}
            <rect x="200" y="190" width="60" height="65" fill="#C5A059" stroke="#E6C687" strokeWidth="1.5" rx="8" />
            <text x="230" y="228" fill="#1C1C1E" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              Lounge
            </text>

            {/* --- CLEARANCE PATH ARROWS & METRICS --- */}
            {/* 1. Lối đi ra ban công (Right clearance) */}
            <g filter="url(#glowGreen)">
              <line x1="575" y1="200" x2="745" y2="200" stroke="#34D399" strokeWidth="2.5" markerEnd="url(#arrow)" />
              {/* Arrow heads */}
              <polygon points="580,196 570,200 580,204" fill="#34D399" />
              <polygon points="740,196 750,200 740,204" fill="#34D399" />
              <rect x="615" y="186" width="90" height="26" fill="#0C0B0A" stroke="#34D399" strokeWidth="1.5" rx="5" />
              <text x="660" y="203" fill="#34D399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                {balconyClearance} cm (An Toàn)
              </text>
            </g>

            {/* 2. Khoảng cách xem TV (Vertical clearance from sofa to TV) */}
            <line x1="425" y1="75" x2="425" y2="145" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3 3" />
            <rect x="380" y="100" width="90" height="20" fill="#0C0B0A" stroke="#60A5FA" strokeWidth="1" rx="4" />
            <text x="425" y="114" fill="#93C5FD" fontSize="9" fontFamily="monospace" textAnchor="middle">
              Khoảng Nhìn: 3.35m
            </text>

            {/* 3. Lối đi vào từ cửa chính (Bottom left clearance) */}
            <line x1="200" y1="360" x2="275" y2="360" stroke="#34D399" strokeWidth="2" />
            <rect x="205" y="348" width="80" height="20" fill="#0C0B0A" stroke="#34D399" strokeWidth="1" rx="4" />
            <text x="245" y="362" fill="#34D399" fontSize="8" fontFamily="monospace" textAnchor="middle">
              Lối Đi: {mainDoorClearance}cm
            </text>
          </svg>
        </div>

        {/* Footer Notes from Chief Architect */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-beige/70">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span>
              <strong>Thế tựa sơn vững chắc:</strong> Lưng sofa áp sát tường phòng, mở rộng tầm nhìn 180° đón vượng khí ban công.
            </span>
          </div>

          <span className="text-[11px] font-mono text-gold/80 bg-gold/10 px-3 py-1 rounded-lg border border-gold/20 shrink-0">
            Dung sai lắp đặt thực tế: ± 2 cm
          </span>
        </div>
      </div>
    </div>
  );
}
