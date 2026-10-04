"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Layers,
  ShoppingBag,
  ArrowRight,
  Eye,
  Camera,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Info,
  Maximize2,
  Compass,
  Palette,
  SunMedium,
  CheckCheck,
  Printer,
  FileText,
  Calendar,
  Award,
  ShieldCheck,
  X,
  FileDown,
  Ruler,
  Building2,
  Flame,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import { useStore } from "@/components/StoreContext";
import { useToast } from "@/components/ToastProvider";
import { formatPrice } from "@/lib/products";
import { aiRoomStylistService, AiRoomAnalysisResult } from "@/services/api";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import SpatialFloorplanCheck from "@/components/SpatialFloorplanCheck";
import InteractiveRoom3DStudio, { StagedItem3D } from "@/components/InteractiveRoom3DStudio";

const PRESET_ROOMS = [
  {
    id: "penthouse_living",
    title: "Phòng Khách Penthouse",
    style: "Modern Italian Luxury",
    image: "/images/staged/penthouse_after.jpg",
    before_image: "/images/staged/penthouse_before.jpg",
    description: "Đại sảnh thông tầng, cửa kính panorama đón nắng và sàn đá tự nhiên.",
  },
  {
    id: "scandi_apartment",
    title: "Căn Hộ Chung Cư",
    style: "Warm Scandinavian & Japandi",
    image: "/images/staged/apartment_after.jpg",
    before_image: "/images/staged/apartment_before.jpg",
    description: "Không gian mở ấm cúng, tối ưu diện tích và ánh sáng ban công.",
  },
  {
    id: "master_bedroom",
    title: "Phòng Ngủ Master",
    style: "Contemporary Serene",
    image: "/images/staged/bedroom_after.jpg",
    before_image: "/images/staged/bedroom_before.jpg",
    description: "Phòng ngủ lớn tiện nghi cao cấp, tông màu tĩnh tại thư giãn.",
  },
  {
    id: "dining_lounge",
    title: "Phòng Ăn & Bếp Mở",
    style: "Neoclassic Dining",
    image: "/images/staged/dining_after.jpg",
    before_image: "/images/staged/dining_before.jpg",
    description: "Không gian tiệc gia đình sang trọng với bàn ăn lớn và tủ rượu.",
  },
];

export default function AiRoomStylistPage() {
  const router = useRouter();
  const { addToCart, openCart } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"preset" | "upload">("preset");
  const [selectedPreset, setSelectedPreset] = useState("penthouse_living");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [roomArea, setRoomArea] = useState("35");
  const [colorTone, setColorTone] = useState("Tone Da Bò Cognac & Đá Marble Sáng");
  const [desiredStyle, setDesiredStyle] = useState("Modern Luxury");

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<AiRoomAnalysisResult | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [addedCombo, setAddedCombo] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dossierId, setDossierId] = useState("GSAI-2026-X89");
  const [visualMode, setVisualMode] = useState<"3d" | "compare">("3d");

  const handleBookConsultation = () => {
    if (!result) return;
    const params = new URLSearchParams({
      from_ai: "1",
      space_type: result.detected_room_type,
      style: result.detected_style,
      area: result.estimated_area,
      budget: `${Math.round(result.combo_package.combo_price / 1000000)} triệu`,
      notes: `[HỒ SƠ AI SPATIAL] Đồ án: ${result.combo_package.name}. KTS Trưởng đề xuất: ${result.architect_advice}. Cần khảo sát mẫu vật liệu tại gia.`,
    });
    router.push(`/booking?${params.toString()}`);
  };

  const handleOpenReport = () => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    setDossierId(`GSAI-${new Date().getFullYear()}-${randomSuffix}`);
    setShowReportModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast({
          type: "error",
          title: "Ảnh quá lớn",
          message: "Vui lòng chọn ảnh dung lượng dưới 8MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setActiveTab("upload");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    setIsScanning(true);
    setScanStep(1);
    setResult(null);
    setAddedCombo(false);

    // Simulated scanning steps for smooth HUD effect
    const t1 = setTimeout(() => setScanStep(2), 600);
    const t2 = setTimeout(() => setScanStep(3), 1200);
    const t3 = setTimeout(() => setScanStep(4), 1800);

    try {
      const payload: any = {
        preset_id: activeTab === "preset" ? selectedPreset : "penthouse_living",
        prompt: userPrompt,
        area: roomArea,
        color_tone: colorTone,
        desired_style: desiredStyle,
        user_note: userPrompt,
      };

      if (activeTab === "upload" && customImage) {
        payload.image_base64 = customImage;
      }

      const res = await aiRoomStylistService.analyze(payload);

      // Ensure minimum 2s scanning animation for WOW factor
      setTimeout(() => {
        if (res.success && res.data) {
          setResult(res.data);
          showToast({
            type: "success",
            title: "Phân tích AI hoàn tất",
            message: `Nhận diện thành công phong cách: ${res.data.detected_style}`,
          });
        } else {
          showToast({
            type: "error",
            title: "Lỗi phân tích",
            message: res.message || "Không thể phân tích ảnh, vui lòng thử lại.",
          });
        }
        setIsScanning(false);
      }, 2200);
    } catch (err) {
      setTimeout(() => {
        setIsScanning(false);
        showToast({
          type: "error",
          title: "Lỗi kết nối",
          message: "Không thể kết nối đến máy chủ AI Visual Search.",
        });
      }, 2200);
    }
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast({
      type: "info",
      title: "Đã sao chép mã màu",
      message: `Đã lưu mã màu ${hex} vào bộ nhớ tạm.`,
    });
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleAddAllToCart = () => {
    if (!result?.combo_package?.items) return;

    result.combo_package.items.forEach((item) => {
      addToCart(
        {
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: Math.round(item.price * 0.9), // Apply 10% combo discount
          original_price: item.price,
          category: { id: 1, name: item.category, slug: "luxury" },
          dimensions: item.dimensions,
          material: item.material,
          images: [{ id: 1, product_id: item.id, image_url: item.image, is_primary: true, sort_order: 1 }],
          sku: `GSL-AI-${item.id}`,
          stock_quantity: 10,
          sold_count: 5,
          rating_avg: 5,
          rating_count: 12,
          is_featured: true,
          is_bestseller: true,
          is_new: true,
          is_active: true,
        },
        1
      );
    });

    setAddedCombo(true);
    showToast({
      type: "success",
      title: "Đã thêm trọn bộ combo!",
      message: `Đã áp dụng ưu đãi giảm 10%, tiết kiệm ${formatPrice(result.combo_package.savings)}.`,
    });

    setTimeout(() => {
      openCart();
    }, 400);
  };

  const handleAddToCartSingle = (item: StagedItem3D | any) => {
    addToCart(
      {
        id: item.id,
        name: item.name,
        slug: item.id,
        price: item.price,
        original_price: item.price,
        category: { id: 1, name: item.role || "Nội thất", slug: "luxury" },
        dimensions: item.dimensions,
        material: item.material,
        images: [{ id: 1, product_id: item.id, image_url: item.image, is_primary: true, sort_order: 1 }],
        sku: `GSL-AI-${item.id}`,
        stock_quantity: 10,
        sold_count: 5,
        rating_avg: 5,
        rating_count: 12,
        is_featured: true,
        is_bestseller: true,
        is_new: true,
        is_active: true,
      },
      1
    );
    showToast({
      type: "success",
      title: "Đã thêm vào giỏ hàng",
      message: `${item.name} đã được thêm vào giỏ.`,
    });
    openCart();
  };

  return (
    <SiteChrome>
      <main className="min-h-screen bg-[#0E0E0E] text-beige py-8 md:py-10 px-4 sm:px-6 lg:px-8 selection:bg-gold selection:text-charcoal relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          {/* Header Banner */}
          <header className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-gold/20 via-amber-500/10 to-gold/20 border border-gold/40 text-gold text-xs font-mono uppercase tracking-widest2">
              <Sparkles size={14} className="text-gold animate-spin" />
              <span>AI Spatial Room Stylist 2.0 • Multimodal Vision</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-champagne tracking-tight leading-tight">
              Trợ Lý Thiết Kế Không Gian Sống Bằng AI
            </h1>

            <p className="text-xs sm:text-sm text-beige/70 leading-relaxed font-light">
              Tải lên ảnh căn phòng của bạn hoặc chọn các không gian mẫu bên dưới. Trí tuệ nhân tạo sẽ phân tích phong cách, ánh sáng, hòa sắc và phối sẵn bộ Combo nội thất chuẩn đo may GS LUXURY vừa vặn từng centimet.
            </p>
          </header>

          {/* Interactive Room Selection & Upload Panel */}
          <div className="bg-charcoal/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
            {/* Tabs Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("preset")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                    activeTab === "preset"
                      ? "bg-gold text-charcoal font-semibold shadow-md"
                      : "text-beige/60 hover:text-beige"
                  }`}
                >
                  <Compass size={15} />
                  <span>Chọn Không Gian Mẫu (Demo Nhanh)</span>
                </button>

                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all ${
                    activeTab === "upload"
                      ? "bg-gold text-charcoal font-semibold shadow-md"
                      : "text-beige/60 hover:text-beige"
                  }`}
                >
                  <UploadCloud size={15} />
                  <span>Tải Ảnh Phòng Của Bạn</span>
                </button>
              </div>

              <div className="text-[11px] text-gold/80 font-mono flex items-center gap-1.5">
                <Zap size={14} className="text-gold" />
                <span>Mô hình: Gemini 1.5 Flash Vision Engine</span>
              </div>
            </div>

            {/* TAB 1: PRESET ROOMS */}
            {activeTab === "preset" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PRESET_ROOMS.map((room) => {
                    const isSelected = selectedPreset === room.id;
                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedPreset(room.id)}
                        className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? "border-gold shadow-lg shadow-gold/20 scale-[1.02]"
                            : "border-white/10 opacity-70 hover:opacity-100 hover:border-white/30"
                        }`}
                      >
                        <div className="relative h-44 w-full">
                          <Image src={room.image} alt={room.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          {isSelected && (
                            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gold text-charcoal flex items-center justify-center shadow">
                              <Check size={14} strokeWidth={2.5} />
                            </span>
                          )}
                        </div>

                        <div className="p-3.5 bg-black/60 backdrop-blur-sm">
                          <h4 className={`text-xs font-serif font-bold truncate ${isSelected ? "text-gold" : "text-beige"}`}>
                            {room.title}
                          </h4>
                          <p className="text-[10px] text-gold/70 font-mono mt-0.5">{room.style}</p>
                          <p className="text-[10px] text-beige/50 line-clamp-2 mt-1">{room.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB 2: UPLOAD CUSTOM IMAGE */
              <div className="space-y-4">
                {customImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gold/50 max-h-80 w-full flex items-center justify-center bg-black/60 group">
                    <img src={customImage} alt="Uploaded room" className="max-h-80 w-auto object-contain" />
                    <button
                      onClick={() => setCustomImage(null)}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 border border-white/20 text-xs text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>Chọn ảnh khác</span>
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-white/15 hover:border-gold/50 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-white/[0.02] text-center group">
                    <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={30} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-beige mb-1">
                      Kéo thả bức ảnh phòng khách / phòng ngủ của bạn vào đây
                    </span>
                    <span className="text-xs text-beige/50 mb-4">
                      Hỗ trợ định dạng JPG, PNG, WEBP lên đến 8MB
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gold font-medium group-hover:bg-gold group-hover:text-charcoal transition-colors">
                      Chọn tệp từ thiết bị
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {/* User Customization Parameters */}
            <div className="pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-beige/80 mb-1.5 normal-case tracking-normal">
                    Diện tích phòng (m²)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={roomArea}
                    onChange={(e) => setRoomArea(e.target.value)}
                    placeholder="Ví dụ: 35"
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-beige placeholder:text-beige/30 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-beige/80 mb-1.5 normal-case tracking-normal">
                    Phong cách thiết kế
                  </label>
                  <select
                    value={desiredStyle}
                    onChange={(e) => setDesiredStyle(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-beige focus:outline-none focus:border-gold transition-colors [&>option]:bg-charcoal [&>option]:text-beige"
                  >
                    <option value="Modern Italian Luxury">Modern Italian Luxury (Ý Sang Trọng)</option>
                    <option value="Warm Scandinavian & Japandi">Bắc Âu Tối Giản & Japandi</option>
                    <option value="Contemporary Serene">Contemporary Đương Đại Tĩnh Lặng</option>
                    <option value="Neoclassic Luxury">Tân Cổ Điển Hoàng Gia</option>
                    <option value="Indochine Heritage">Đông Dương Sang Trọng (Indochine)</option>
                    <option value="Minimalist Wabi-Sabi">Tối Giản Mộc Wabi-Sabi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-beige/80 mb-1.5 normal-case tracking-normal">
                    Tông màu mong muốn
                  </label>
                  <input
                    type="text"
                    value={colorTone}
                    onChange={(e) => setColorTone(e.target.value)}
                    placeholder="VD: Da bò cognac, kem oatmeal, xám than..."
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-beige placeholder:text-beige/30 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-beige/80 mb-1.5 normal-case tracking-normal">
                  Yêu cầu kiến trúc sư & công năng bổ sung (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="Ví dụ: Cần bàn trà đá cẩm thạch sáng, phòng nhiều nắng hướng Tây, nhà có trẻ nhỏ..."
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-beige placeholder:text-beige/30 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            {/* Trigger Button */}
            <div className="text-center pt-2">
              <button
                onClick={handleStartAnalysis}
                disabled={isScanning}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-gold via-[#F0D8A8] to-gold text-charcoal font-semibold text-xs uppercase tracking-widest2 shadow-xl shadow-gold/25 hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 inline-flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles size={16} className={isScanning ? "animate-spin" : ""} />
                <span>{isScanning ? "AI Đang Dựng Mô Hình Không Gian 3D..." : "Phân Tích Ảnh & Dựng Không Gian 3D"}</span>
              </button>
            </div>
          </div>

          {/* SCANNING SIMULATION HUD */}
          {isScanning && (
            <div className="bg-charcoal/90 border border-gold/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-fade-in">
              {/* Laser scanning beam line animation */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent animate-pulse" />

              <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center mx-auto animate-bounce">
                <Sparkles size={28} className="text-gold" />
              </div>

              <div>
                <h3 className="font-serif text-xl text-champagne">
                  Hệ Thống Đang Xử Lý &amp; Tái Lập Không Gian 3D
                </h3>
                <p className="text-xs text-beige/60 mt-1 font-mono">
                  Mô hình Vision AI đang bóc tách kết cấu và gắn sản phẩm 3D vào phòng...
                </p>
              </div>

              {/* Progress checklist steps */}
              <div className="max-w-md mx-auto space-y-2.5 text-left text-xs font-mono">
                <div className={`flex items-center gap-2.5 transition-colors ${scanStep >= 1 ? "text-emerald-400" : "text-beige/30"}`}>
                  <CheckCircle2 size={15} />
                  <span>[01/04] Nhận diện vách tường, cao độ trần &amp; hướng cửa sổ tự nhiên</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${scanStep >= 2 ? "text-emerald-400" : "text-beige/30"}`}>
                  <CheckCircle2 size={15} />
                  <span>[02/04] Tái lập cấu trúc không gian 3 chiều (3D Mesh) chuẩn tỷ lệ 1:1</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${scanStep >= 3 ? "text-emerald-400" : "text-beige/30"}`}>
                  <CheckCircle2 size={15} />
                  <span>[03/04] Gắn sản phẩm 3D đề xuất (Sofa, bàn trà, đèn) vào tọa độ mặt bằng</span>
                </div>
                <div className={`flex items-center gap-2.5 transition-colors ${scanStep >= 4 ? "text-emerald-400" : "text-beige/30"}`}>
                  <CheckCircle2 size={15} />
                  <span>[04/04] Khởi tạo studio 3D WebGL cho phép bạn tương tác xoay 360° tự do</span>
                </div>
              </div>
            </div>
          )}

          {/* AI ANALYSIS RESULTS & RECOMMENDED COMBO (5-LAYER ARCHITECTURAL BLUEPRINT) */}
          {result && !isScanning && (
            <div className="space-y-12 animate-fade-in">
              {/* Studio Master Header & Action Bar */}
              <div className="bg-gradient-to-r from-charcoal via-[#231D19] to-charcoal border border-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-[11px] font-mono tracking-wider uppercase font-semibold flex items-center gap-1.5">
                        <Award size={13} />
                        <span>Hồ Sơ Thẩm Định Kiến Trúc &amp; Nội Thất</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                        {result.is_ai_vision ? "⚡ Gemini 3.5 Flash Vision Multimodal" : "✓ GS Luxury Studio Accredited"}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl text-champagne font-normal">
                      {result.detected_room_type}
                    </h2>

                    <p className="text-xs text-beige/70 font-light max-w-2xl">
                      Đồ án thiết kế phối cảnh độc bản: <strong className="text-gold font-medium">{result.combo_package.name}</strong> • Độ chuẩn xác quang học &amp; tỷ lệ vàng: <span className="text-emerald-400 font-mono font-semibold">{result.confidence_score}%</span>
                    </p>
                  </div>

                  {/* Top 2 Professional CTA Buttons */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <button
                      onClick={handleBookConsultation}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-gold via-[#F0D8A8] to-gold text-charcoal font-semibold text-xs uppercase tracking-wider shadow-lg shadow-gold/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar size={15} />
                      <span>Đặt Lịch KTS Trưởng Khảo Sát (0đ)</span>
                    </button>

                    <button
                      onClick={handleOpenReport}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-white/5 border border-white/20 hover:border-gold/60 text-beige hover:text-gold text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer size={15} />
                      <span>Xuất Báo Cáo Thẩm Định (PDF)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: 3D SPATIAL STUDIO & BEFORE/AFTER VIEWER */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                      <span className="text-[11px] font-mono uppercase tracking-widest2 text-gold font-semibold">
                        Không Gian 3D Trực Quan Tương Tác
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-champagne font-normal">
                      Phối Cảnh Không Gian Thực Vào 3D Sống Động
                    </h3>
                    <p className="text-xs text-beige/65 mt-0.5">
                      {visualMode === "3d"
                        ? "Không gian 3D WebGL: Xoay 360°, đổi góc nhìn camera, đổi ánh sáng và bấm vào từng món đồ để xem bóc tách chi tiết."
                        : "Kéo thanh trượt để so sánh trực tiếp phòng thực tế và căn phòng sau khi bày biện nội thất GS Luxury."}
                    </p>
                  </div>

                  {/* Mode Switcher Tabs */}
                  <div className="flex items-center bg-black/60 border border-white/15 rounded-2xl p-1 shadow-lg shrink-0">
                    <button
                      onClick={() => setVisualMode("3d")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                        visualMode === "3d"
                          ? "bg-gradient-to-r from-gold via-[#F0D8A8] to-gold text-charcoal shadow-md"
                          : "text-beige/60 hover:text-white"
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>Studio 3D Realtime (360°)</span>
                    </button>

                    <button
                      onClick={() => setVisualMode("compare")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                        visualMode === "compare"
                          ? "bg-gradient-to-r from-gold via-[#F0D8A8] to-gold text-charcoal shadow-md"
                          : "text-beige/60 hover:text-white"
                      }`}
                    >
                      <Layers size={14} />
                      <span>So Sánh Ảnh 2D</span>
                    </button>
                  </div>
                </div>

                {visualMode === "3d" ? (
                  <InteractiveRoom3DStudio
                    roomType={result.detected_room_type}
                    styleName={result.detected_style}
                    roomArea={result.floorplan_data?.room_area || result.estimated_area || roomArea}
                    originalImage={
                      result.before_image_url ||
                      (activeTab === "upload" && customImage
                        ? customImage
                        : `/images/staged/penthouse_before.jpg`)
                    }
                    items={result.combo_package?.items?.map((item, idx) => ({
                      id: item.id,
                      name: item.name,
                      role: item.role,
                      material: item.material,
                      dimensions: item.dimensions,
                      price: item.price,
                      image: item.image,
                      reason: item.reason,
                      badge: idx === 0 ? "Tâm điểm" : idx === 1 ? "Bàn trà" : "Ghế lounge",
                      modelType: (idx === 0 ? "sofa" : idx === 1 ? "table" : "chair") as any,
                    }))}
                    onAddToCart={handleAddToCartSingle}
                    onAddComboToCart={handleAddAllToCart}
                    onBookConsultation={handleBookConsultation}
                  />
                ) : (
                  <BeforeAfterSlider
                    beforeImage={
                      result.before_image_url ||
                      (activeTab === "upload" && customImage
                        ? customImage
                        : `/images/staged/penthouse_before.jpg`)
                    }
                    afterImage={
                      result.staged_image_url ||
                      `/images/staged/penthouse_after.jpg`
                    }
                    roomTitle={result.detected_room_type}
                    styleName={result.detected_style}
                  />
                )}
              </div>

              {/* SECTION: 2D SPATIAL FLOORPLAN & CIRCULATION CLEARANCE */}
              <SpatialFloorplanCheck
                roomArea={result.floorplan_data?.room_area || result.estimated_area || roomArea}
                roomWidth={result.floorplan_data?.room_width || 4.8}
                roomLength={result.floorplan_data?.room_length || 7.2}
                sofaName={result.floorplan_data?.sofa_name || result.combo_package?.items?.[0]?.name || "Sofa Modular Riviera 3 Chỗ"}
                sofaDimensions={result.floorplan_data?.sofa_dimensions || result.combo_package?.items?.[0]?.dimensions || "280 x 105 x 82 cm"}
                tableDimensions={result.floorplan_data?.table_dimensions || result.combo_package?.items?.[1]?.dimensions || "120 x 70 x 42 cm"}
                balconyClearance={result.floorplan_data?.balcony_clearance || 115}
                mainDoorClearance={result.floorplan_data?.main_door_clearance || 135}
                coveragePercent={result.floorplan_data?.coverage_percent || 24.5}
              />

              {/* 5-LAYER ARCHITECTURAL BLUEPRINT GRID */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold animate-ping" />
                  <h3 className="text-xs uppercase font-mono tracking-widest2 text-gold">
                    Bóc Tách Chuyên Môn 5 Tầng Không Gian
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* LAYER 1: STRUCTURAL REALITY */}
                  <div className="bg-charcoal/80 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-gold/40 transition-colors">
                    <div className="flex items-center justify-between text-gold text-xs font-mono">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Building2 size={15} />
                        <span>TẦNG 01: KẾT CẤU</span>
                      </span>
                      <span className="text-[10px] text-beige/40">Hiện trạng</span>
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-champagne">
                      Trần, Sàn &amp; Hệ Khung Cửa
                    </h4>

                    <div className="space-y-2 text-xs text-beige/75 leading-relaxed font-light">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <strong className="text-beige block text-[11px] mb-0.5">Trần nhà:</strong>
                        <span>{result.structural_analysis?.ceiling || "Trần thạch cao phẳng kết hợp họng gió âm trần cao độ 3.0m."}</span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <strong className="text-beige block text-[11px] mb-0.5">Sàn &amp; Cửa:</strong>
                        <span>{result.structural_analysis?.floor || "Sàn đá/gỗ cao cấp."} • {result.structural_analysis?.walls_windows || "Hệ vách đón sáng tự nhiên."}</span>
                      </div>
                    </div>
                  </div>

                  {/* LAYER 2: SPATIAL & LIGHTING EVALUATION */}
                  <div className="bg-charcoal/80 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-gold/40 transition-colors">
                    <div className="flex items-center justify-between text-gold text-xs font-mono">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <SunMedium size={15} />
                        <span>TẦNG 02: QUANG HỌC</span>
                      </span>
                      <span className="text-[10px] text-beige/40">Vi khí hậu</span>
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-champagne">
                      Ánh Sáng &amp; Ưu/Nhược Điểm
                    </h4>

                    <div className="space-y-2 text-xs text-beige/75 leading-relaxed font-light">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <strong className="text-emerald-400 block text-[11px] mb-0.5 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Ưu thế mặt bằng:
                        </strong>
                        <span>{result.spatial_evaluation?.pros || "Mặt bằng vuông vức, thông gió đối lưu tự nhiên tốt."}</span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <strong className="text-amber-400 block text-[11px] mb-0.5 flex items-center gap-1">
                          <AlertTriangle size={11} /> Thách thức cần xử lý:
                        </strong>
                        <span>{result.spatial_evaluation?.cons || "Bề mặt phản xạ cần bổ sung thảm dệt tiêu âm."}</span>
                      </div>
                    </div>
                  </div>

                  {/* LAYER 3: LAYOUT & ZONING BLUEPRINT */}
                  <div className="bg-charcoal/80 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-gold/40 transition-colors">
                    <div className="flex items-center justify-between text-gold text-xs font-mono">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Compass size={15} />
                        <span>TẦNG 03: ZONING</span>
                      </span>
                      <span className="text-[10px] text-beige/40">Công năng</span>
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-champagne">
                      Tiêu Điểm &amp; Luồng Giao Thông
                    </h4>

                    <div className="space-y-2 text-xs text-beige/75 leading-relaxed font-light">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <strong className="text-beige block text-[11px] mb-0.5">Tiêu điểm vàng (Focal Point):</strong>
                        <span>{result.layout_zoning?.focal_point || "Tâm điểm phòng khách đón tầm nhìn trực diện ban công."}</span>
                      </div>
                      <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                        <strong className="text-beige block text-[11px] mb-0.5">Bố trí &amp; Khoảng đệm:</strong>
                        <span>{result.layout_zoning?.furniture_placement || "Đặt sofa chính vuông góc vách tường đón sáng."}</span>
                      </div>
                    </div>
                  </div>

                  {/* LAYER 4: MATERIAL MATRIX & COLOR HARMONY */}
                  <div className="bg-charcoal/80 border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-gold/40 transition-colors">
                    <div className="flex items-center justify-between text-gold text-xs font-mono">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Palette size={15} />
                        <span>TẦNG 04: VẬT LIỆU</span>
                      </span>
                      <span className="text-[10px] text-beige/40">Hòa sắc HEX</span>
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-champagne">
                      Khuyên Dùng &amp; Kiêng Kỵ
                    </h4>

                    <div className="space-y-2 text-xs text-beige/75 leading-relaxed font-light">
                      <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                        <p className="text-[10px] text-emerald-400 font-medium mb-1 uppercase tracking-wide">✓ Vật liệu khuyên dùng:</p>
                        <p className="text-[11px] text-beige font-mono leading-tight">
                          {result.material_matrix?.recommended?.join(" • ") || "Da Ý tự nhiên • Đá Marble Calacatta • Khung mạ PVD"}
                        </p>
                      </div>
                      <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                        <p className="text-[10px] text-rose-400 font-medium mb-1 uppercase tracking-wide">✗ Kiêng kỵ nên tránh:</p>
                        <p className="text-[11px] text-beige/60 font-mono leading-tight">
                          {result.material_matrix?.avoid?.join(" • ") || "Simili công nghiệp • Gương đối diện nguồn nắng gắt"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLOR SWATCH CHIPS ROW */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-gold">
                    <Palette size={15} />
                    <span>Hòa Sắc Thực Tế Bóc Tách Từ Không Gian (Bấm để chép mã HEX)</span>
                  </div>
                  <span className="text-[11px] text-beige/50 font-light">Tỷ lệ hòa sắc 60 - 30 - 10 chuẩn châu Âu</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {result.color_palette.map((c) => (
                    <div
                      key={c.hex}
                      onClick={() => handleCopyColor(c.hex)}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-charcoal/80 border border-white/10 hover:border-gold/50 cursor-pointer transition-all group"
                      title="Bấm để sao chép mã màu HEX"
                    >
                      <span className="w-7 h-7 rounded-lg border border-white/20 shrink-0 shadow" style={{ backgroundColor: c.hex }} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-beige truncate group-hover:text-gold">{c.name}</p>
                        <p className="text-[10px] text-beige/50 font-mono flex items-center gap-1">
                          <span>{c.hex}</span>
                          {copiedHex === c.hex ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ARCHITECT'S STRATEGIC ADVICE QUOTE */}
              <div className="bg-gradient-to-r from-charcoal via-[#2A231D] to-charcoal border-l-4 border-gold rounded-2xl p-6 sm:p-8 space-y-3 shadow-xl">
                <div className="flex items-center gap-2 text-gold text-xs font-mono uppercase tracking-widest2">
                  <Award size={16} />
                  <span>Lời Khuyên Thực Thi Từ KTS Trưởng GS Luxury</span>
                </div>
                <blockquote className="font-serif text-base sm:text-lg text-champagne italic font-normal leading-relaxed">
                  &ldquo;{result.architect_advice}&rdquo;
                </blockquote>
                <div className="pt-2 flex items-center justify-between text-xs text-beige/60">
                  <p>Hội Đồng Giám Tuyển Kiến Trúc &amp; Sản Phẩm GS Luxury Studio</p>
                  <p className="font-mono text-[11px] text-gold/80">Khảo sát &amp; may đo độc bản 1:1</p>
                </div>
              </div>

              {/* LAYER 5: RECOMMENDED COMBO PACKAGE */}
              <div className="bg-gradient-to-b from-charcoal via-charcoal/95 to-black border border-gold/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-l from-gold to-amber-500 text-charcoal font-bold text-xs uppercase tracking-widest2 rounded-bl-2xl shadow">
                  Combo Đề Xuất Giảm 10%
                </div>

                {/* Package Header */}
                <div className="space-y-2">
                  <p className="text-gold text-xs font-mono uppercase tracking-widest2">LỚP 05: BẢN PHỐI CẢNH NỘI THẤT ĂN KHỚP</p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-champagne">
                    {result.combo_package.name}
                  </h2>
                  <p className="text-xs text-beige/60">
                    Bộ 3 món nội thất tâm điểm được KTS Trưởng chọn lọc trực tiếp từ catalog thực tế để tôn vinh kết cấu và ánh sáng của phòng.
                  </p>
                </div>

                {/* 3 Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {result.combo_package.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-gold/50 transition-all duration-300 group"
                    >
                      <div className="space-y-3">
                        <div className="relative h-48 w-full rounded-xl overflow-hidden bg-black/60">
                          <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 border border-gold/40 text-gold text-[10px] font-mono">
                            Món 0{index + 1}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-gold font-mono uppercase tracking-wider block">{item.role}</span>
                          <h4 className="font-serif text-sm font-bold text-champagne mt-0.5 truncate">{item.name}</h4>
                          <p className="text-[11px] text-beige/50 line-clamp-1 mt-0.5">{item.material}</p>
                          <p className="text-[10px] text-beige/40 font-mono mt-0.5">{item.dimensions}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-beige/70 leading-relaxed italic">
                          &ldquo;{item.reason}&rdquo;
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-3">
                        <div>
                          <span className="text-[10px] text-beige/40 block">Giá niêm yết:</span>
                          <span className="font-serif text-sm text-beige font-semibold line-through decoration-gold/60">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 block font-mono">Giá theo Combo:</span>
                          <span className="font-serif text-sm text-gold font-bold">
                            {formatPrice(Math.round(item.price * 0.9))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & 3 Strategic CTA Buttons */}
                <div className="bg-black/60 border border-gold/30 rounded-2xl p-6 flex flex-col xl:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center xl:text-left">
                    <p className="text-xs text-beige/60">Tổng giá trị trọn bộ 3 sản phẩm:</p>
                    <div className="flex flex-wrap items-baseline gap-3 justify-center xl:justify-start">
                      <span className="text-base text-beige/50 line-through">
                        {formatPrice(result.combo_package.original_total)}
                      </span>
                      <span className="font-serif text-2xl sm:text-3xl text-gold font-bold">
                        {formatPrice(result.combo_package.combo_price)}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold font-mono border border-emerald-500/40">
                        Tiết kiệm {formatPrice(result.combo_package.savings)} (-10%)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 w-full xl:w-auto">
                    {/* CTA 1: Add Combo to Cart */}
                    <button
                      onClick={handleAddAllToCart}
                      className={`flex-1 sm:flex-none px-6 py-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
                        addedCombo
                          ? "bg-emerald-500 text-charcoal shadow-emerald-500/25"
                          : "bg-gradient-to-r from-gold via-[#F0D8A8] to-gold text-charcoal shadow-gold/30 hover:brightness-110 active:scale-95"
                      }`}
                    >
                      {addedCombo ? (
                        <>
                          <CheckCheck size={16} />
                          <span>Đã Thêm Trọn Bộ Vào Giỏ!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>Thêm Cả Bộ (-10%)</span>
                        </>
                      )}
                    </button>

                    {/* CTA 2: Book Architect on-site consultation */}
                    <button
                      onClick={handleBookConsultation}
                      className="flex-1 sm:flex-none px-6 py-4 rounded-xl bg-gold/15 border border-gold text-champagne hover:bg-gold hover:text-charcoal text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Calendar size={16} />
                      <span>Đặt Lịch KTS Khảo Sát Tận Nhà</span>
                    </button>

                    {/* CTA 3: Open Official Report PDF/Print Modal */}
                    <button
                      onClick={handleOpenReport}
                      className="flex-1 sm:flex-none px-5 py-4 rounded-xl bg-white/5 border border-white/20 hover:border-gold/50 text-beige hover:text-gold text-xs uppercase tracking-wider font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileDown size={16} />
                      <span>In Báo Cáo PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OFFICIAL ARCHITECTURAL DOSSIER PRINT/EXPORT MODAL */}
          {showReportModal && result && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <div className="bg-[#FAF7F2] text-[#2C241E] max-w-4xl w-full rounded-3xl shadow-2xl border border-[#D4AF37]/50 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Top Control Bar (Hidden on print) */}
                <div className="bg-[#1C1815] text-beige px-6 py-4 flex items-center justify-between border-b border-gold/30 print:hidden">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Award size={15} className="text-gold" />
                    <span className="text-champagne font-semibold uppercase tracking-wider">
                      Hồ Sơ Thẩm Định Kiến Trúc &amp; Nội Thất Độc Bản
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-gold text-charcoal font-semibold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 transition-all shadow"
                    >
                      <Printer size={14} />
                      <span>In / Lưu PDF (A4)</span>
                    </button>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-beige transition-colors"
                      title="Đóng hồ sơ"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Printable Document Sheet (A4 Gallery Style) */}
                <div id="printable-dossier" className="p-8 sm:p-12 space-y-8 bg-white print:p-0">
                  {/* Official Header */}
                  <div className="border-b-2 border-[#2C241E] pb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest2 text-[#8B6E4E] font-bold block mb-1">
                        GS LUXURY ARCHITECTURAL STUDIO • BESPOKE FURNITURE
                      </span>
                      <h1 className="font-serif text-2xl sm:text-3xl text-[#2C241E] font-normal tracking-tight">
                        HỒ SƠ THẨM ĐỊNH KHÔNG GIAN KIẾN TRÚC
                      </h1>
                      <p className="text-xs text-stone-600 mt-1">
                        Đồ án: <strong className="text-stone-900">{result.combo_package.name}</strong>
                      </p>
                    </div>

                    <div className="text-left sm:text-right font-mono text-[11px] text-stone-600 space-y-0.5">
                      <p>MÃ HỒ SƠ: <strong className="text-stone-900">{dossierId}</strong></p>
                      <p>NGÀY THẨM ĐỊNH: <span className="text-stone-900">{new Date().toLocaleDateString("vi-VN")}</span></p>
                      <p className="text-emerald-700 font-semibold">TÌNH TRẠNG: ĐÃ PHÊ DUYỆT (ACCREDITED)</p>
                    </div>
                  </div>

                  {/* Top Information: Image + Overview Box */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 relative min-h-[220px]">
                      <img
                        src={customImage || PRESET_ROOMS.find(p => p.id === result.preset_id)?.image || "/images/hero-banner.jpg"}
                        alt="Hiện trạng phòng"
                        className="w-full h-full object-cover"
                      />
                      {/* Red Stamp Badge */}
                      <div className="absolute bottom-2 right-2 border-2 border-red-600 text-red-600 font-serif text-[10px] uppercase font-bold px-2 py-1 rounded rotate-[-6deg] bg-white/90 shadow-sm">
                        GS LUXURY APPROVED
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3 bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 text-xs">
                      <div className="grid grid-cols-2 gap-3 border-b border-stone-200 pb-3">
                        <div>
                          <span className="text-stone-500 block text-[10px]">Loại không gian:</span>
                          <strong className="text-stone-900 text-sm font-serif">{result.detected_room_type}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">Phong cách kiến trúc:</span>
                          <strong className="text-stone-900 text-sm font-serif">{result.detected_style}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">Diện tích tính toán:</span>
                          <strong className="text-stone-900">{result.estimated_area}</strong>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">Độ tương thích tỷ lệ:</span>
                          <strong className="text-emerald-700 font-mono">{result.confidence_score}% (Tối ưu)</strong>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <strong className="text-stone-800 block text-[11px]">Đánh giá quang học &amp; hướng sáng:</strong>
                        <p className="text-stone-600 italic leading-relaxed">
                          &ldquo;{result.lighting_analysis}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4-Column Technical Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <strong className="text-[#8B6E4E] font-mono text-[11px] block uppercase">1. Bóc Tách Kết Cấu Thực Tế</strong>
                      <p className="text-stone-700"><strong>Trần:</strong> {result.structural_analysis?.ceiling}</p>
                      <p className="text-stone-700"><strong>Sàn:</strong> {result.structural_analysis?.floor}</p>
                      <p className="text-stone-700"><strong>Tường &amp; Cửa:</strong> {result.structural_analysis?.walls_windows}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <strong className="text-[#8B6E4E] font-mono text-[11px] block uppercase">2. Đánh Giá Quang Học &amp; Vi Khí Hậu</strong>
                      <p className="text-emerald-700"><strong>Ưu thế:</strong> {result.spatial_evaluation?.pros}</p>
                      <p className="text-amber-700"><strong>Thách thức:</strong> {result.spatial_evaluation?.cons}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <strong className="text-[#8B6E4E] font-mono text-[11px] block uppercase">3. Sơ Đồ Bố Trí Công Năng (Zoning)</strong>
                      <p className="text-stone-700"><strong>Tiêu điểm:</strong> {result.layout_zoning?.focal_point}</p>
                      <p className="text-stone-700"><strong>Vị trí đặt đồ:</strong> {result.layout_zoning?.furniture_placement}</p>
                      <p className="text-stone-700"><strong>Giao thông:</strong> {result.layout_zoning?.circulation}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <strong className="text-[#8B6E4E] font-mono text-[11px] block uppercase">4. Ma Trận Vật Liệu Thượng Hạng</strong>
                      <p className="text-emerald-800"><strong>Nên dùng:</strong> {result.material_matrix?.recommended?.join(", ")}</p>
                      <p className="text-rose-800"><strong>Cần tránh:</strong> {result.material_matrix?.avoid?.join(", ")}</p>
                    </div>
                  </div>

                  {/* Color Palette Swatches */}
                  <div className="space-y-2">
                    <strong className="text-[#8B6E4E] font-mono text-[11px] block uppercase">Bảng Hòa Sắc Tiêu Chuẩn Sơn &amp; Vật Liệu (HEX Swatches)</strong>
                    <div className="grid grid-cols-4 gap-3">
                      {result.color_palette.map((c) => (
                        <div key={c.hex} className="p-2.5 rounded-xl border border-stone-200 flex items-center gap-2.5 bg-stone-50">
                          <span className="w-6 h-6 rounded-md border border-stone-300 shrink-0" style={{ backgroundColor: c.hex }} />
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-stone-800 truncate">{c.name}</p>
                            <p className="text-[10px] font-mono text-stone-500">{c.hex}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Combo Table Breakdown */}
                  <div className="space-y-2">
                    <strong className="text-[#8B6E4E] font-mono text-[11px] block uppercase">Dự Toán Bộ 3 Sản Phẩm Tâm Điểm Đề Xuất (Combo May Đo)</strong>
                    <div className="border border-stone-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-stone-200 text-stone-700 font-mono text-[10px]">
                            <th className="p-3">HẠNG MỤC / VAI TRÒ</th>
                            <th className="p-3">TÊN SẢN PHẨM &amp; CHẤT LIỆU</th>
                            <th className="p-3 text-right">GIÁ NIÊM YẾT</th>
                            <th className="p-3 text-right text-emerald-800">GIÁ THEO COMBO (-10%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {result.combo_package.items.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-stone-50">
                              <td className="p-3 font-mono text-stone-500 text-[11px]">{item.role}</td>
                              <td className="p-3">
                                <strong className="text-stone-900 block">{item.name}</strong>
                                <span className="text-[10px] text-stone-500">{item.material} • {item.dimensions}</span>
                              </td>
                              <td className="p-3 text-right text-stone-500 line-through">{formatPrice(item.price)}</td>
                              <td className="p-3 text-right font-semibold text-[#8B6E4E] font-mono">{formatPrice(Math.round(item.price * 0.9))}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#FAF7F2] font-semibold border-t-2 border-stone-200">
                            <td colSpan={2} className="p-3 font-serif text-stone-900">TỔNG DỰ TOÁN TRỌN BỘ COMBO:</td>
                            <td className="p-3 text-right text-stone-500 line-through">{formatPrice(result.combo_package.original_total)}</td>
                            <td className="p-3 text-right text-sm text-[#8B6E4E] font-mono">{formatPrice(result.combo_package.combo_price)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Signatures & Certification Stamp */}
                  <div className="pt-6 border-t border-stone-200 grid grid-cols-2 items-end">
                    <div className="text-xs text-stone-500 space-y-1">
                      <p>• Bảo hành 5 năm kết cấu &amp; bảo trì da/gỗ trọn đời.</p>
                      <p>• Khảo sát hiện trạng &amp; ướm mẫu da thật miễn phí tại gia.</p>
                      <p className="font-mono text-[10px] text-stone-400">GS LUXURY BESPOKE INTERIOR ARCHITECTURE</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] uppercase font-mono text-stone-500 block">GIÁM ĐỐC KIẾN TRÚC GS LUXURY</span>
                      <p className="font-serif italic text-lg text-stone-800">Nguyễn Hoàng Long</p>
                      <span className="text-[10px] text-stone-400 block font-mono">KTS. Trưởng Phụ Trách Thẩm Định</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls (Hidden on print) */}
                <div className="bg-[#FAF7F2] px-8 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
                  <span className="text-xs text-stone-500">
                    Bấm &ldquo;In / Lưu PDF&rdquo; để tải bản scan chất lượng cao lưu trữ hoặc gửi gia đình duyệt.
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-all"
                    >
                      Đóng Lại
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-2.5 rounded-xl bg-[#2C241E] text-beige text-xs font-semibold hover:bg-[#8B6E4E] transition-all flex items-center gap-2 shadow"
                    >
                      <Printer size={15} />
                      <span>In Báo Cáo / Lưu PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </SiteChrome>
  );
}

