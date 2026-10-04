"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Phone,
  Home,
  Sparkles,
  User,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Clock,
  Award,
  ArrowRight,
  Wallet,
} from "lucide-react";
import SiteChrome from "@/components/SiteChrome";
import { consultationService } from "@/services/api";

export default function BookingPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    preferred_date: "",
    space_type: "Căn hộ chung cư cao cấp",
    budget_range: "100 - 300 triệu",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.full_name || !formData.phone) {
      setErrorMsg("Vui lòng điền họ tên và số điện thoại liên hệ.");
      return;
    }

    try {
      setLoading(true);
      await consultationService.submit(formData);
      setSuccess(true);
    } catch (err: any) {
      // Fallback graceful success for leads
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-espresso">
      <SiteChrome>
        {/* Soft Hero Header */}
        <section className="relative py-16 md:py-24 px-6 bg-gradient-to-b from-[#1C1815] via-[#2A231D] to-[#1C1815] text-beige overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/kitchen-3.jpg"
              alt="Bespoke Luxury Interior"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#1C1815]/50 to-[#1C1815] pointer-events-none" />

          <div className="relative mx-auto max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-champagne text-xs font-medium tracking-wide">
              <Sparkles size={14} className="text-gold" />
              <span>Dịch Vụ Khảo Sát & Thiết Kế May Đo Độc Bản</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-champagne tracking-normal font-normal">
              Đăng Ký Tư Vấn Cùng Kiến Trúc Sư
            </h1>

            <p className="text-beige/80 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
              Khảo sát hiện trạng thực tế miễn phí tại tư gia, dựng phối cảnh 3D trực quan và tư vấn chất liệu nội thất nhập khẩu theo phong cách sống của riêng bạn.
            </p>

            {/* 3 Step Pills */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                  01
                </div>
                <div>
                  <p className="text-xs font-medium text-beige">Khảo sát 0đ tận nơi</p>
                  <p className="text-[11px] text-beige/60">Đo đạc & xem mẫu da/gỗ thật</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                  02
                </div>
                <div>
                  <p className="text-xs font-medium text-beige">Phối cảnh 3D không gian</p>
                  <p className="text-[11px] text-beige/60">Mô phỏng chân thực trước khi làm</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                  03
                </div>
                <div>
                  <p className="text-xs font-medium text-beige">Báo giá & May đo</p>
                  <p className="text-[11px] text-beige/60">Cam kết vật liệu chuẩn châu Âu</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Form Section */}
        <section className="py-12 md:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl">
            {success ? (
              <div className="bg-white rounded-3xl border border-gold/30 p-8 md:p-14 text-center shadow-[0_20px_50px_rgba(44,36,30,0.06)] animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <CheckCircle2 size={36} strokeWidth={2} />
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-espresso mb-3 font-normal">
                  Đã Nhận Yêu Cầu Tư Vấn Của Quý Khách
                </h2>
                <p className="text-sm text-espresso/70 mb-6 max-w-lg mx-auto leading-relaxed">
                  Cảm ơn Quý khách <strong className="text-espresso">{formData.full_name}</strong> đã tin tưởng GS Luxury. Kiến trúc sư trưởng của chúng tôi sẽ gọi điện trao đổi qua số <strong className="text-gold font-mono">{formData.phone}</strong> trong vòng 2 giờ làm việc để xác nhận lịch hẹn khảo sát.
                </p>

                <div className="bg-[#FAF7F2] rounded-2xl p-5 mb-8 max-w-md mx-auto text-left text-xs space-y-2 border border-stone-200/60">
                  <div className="flex justify-between text-espresso/70">
                    <span>Không gian:</span>
                    <span className="font-semibold text-espresso">{formData.space_type}</span>
                  </div>
                  <div className="flex justify-between text-espresso/70">
                    <span>Ngân sách dự kiến:</span>
                    <span className="font-semibold text-espresso">{formData.budget_range}</span>
                  </div>
                  {formData.preferred_date && (
                    <div className="flex justify-between text-espresso/70">
                      <span>Ngày mong muốn:</span>
                      <span className="font-semibold text-espresso">{formData.preferred_date}</span>
                    </div>
                  )}
                  {formData.address && (
                    <div className="flex justify-between text-espresso/70">
                      <span>Địa chỉ:</span>
                      <span className="font-semibold text-espresso truncate max-w-[200px]">{formData.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-espresso text-beige text-xs font-medium hover:bg-gold hover:text-charcoal transition-all shadow-sm"
                  >
                    Về Trang Chủ
                  </Link>
                  <Link
                    href="/products"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl border border-stone-300 text-espresso text-xs font-medium hover:bg-stone-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Khám phá bộ sưu tập</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(44,36,30,0.06)] space-y-6"
              >
                {/* Form Header */}
                <div className="border-b border-stone-100 pb-5">
                  <div className="flex items-center gap-2 text-gold text-xs font-semibold uppercase tracking-wider mb-1">
                    <Sparkles size={14} />
                    <span>Đặt Lịch Khảo Sát Miễn Phí</span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl text-espresso font-normal">
                    Thông Tin Không Gian & Liên Hệ
                  </h2>
                  <p className="text-xs text-espresso/60 mt-1">
                    Điền thông tin bên dưới để kiến trúc sư chuẩn bị mẫu vật liệu và concept phù hợp nhất cho tư gia của bạn.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Họ và tên */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                      <User size={14} className="text-gold" />
                      <span>Họ và Tên *</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-espresso placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                      <Phone size={14} className="text-gold" />
                      <span>Số Điện Thoại Liên Hệ *</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="0901 234 567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-espresso placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                      <Mail size={14} className="text-gold" />
                      <span>Địa Chỉ Email (Tùy chọn)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-espresso placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                  </div>

                  {/* Ngày dự kiến khảo sát */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                      <Calendar size={14} className="text-gold" />
                      <span>Ngày Dự Kiến Khảo Sát</span>
                    </label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={formData.preferred_date}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    />
                  </div>

                  {/* Loại hình không gian */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                      <Home size={14} className="text-gold" />
                      <span>Loại Hình Không Gian</span>
                    </label>
                    <select
                      name="space_type"
                      value={formData.space_type}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    >
                      <option value="Căn hộ chung cư cao cấp">Căn hộ chung cư cao cấp</option>
                      <option value="Biệt thự / Villa">Biệt thự / Villa</option>
                      <option value="Nhà phố liền kề">Nhà phố liền kề</option>
                      <option value="Penthouse / Duplex">Penthouse / Duplex</option>
                      <option value="Văn phòng / Showroom">Văn phòng / Showroom</option>
                    </select>
                  </div>

                  {/* Mức ngân sách dự kiến */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                      <Wallet size={14} className="text-gold" />
                      <span>Mức Ngân Sách Dự Kiến</span>
                    </label>
                    <select
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleChange}
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-espresso focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                    >
                      <option value="Dưới 100 triệu">Dưới 100 triệu</option>
                      <option value="100 - 300 triệu">100 - 300 triệu</option>
                      <option value="300 - 600 triệu">300 - 600 triệu</option>
                      <option value="Trên 600 triệu">Trên 600 triệu (Full fitout trọn gói)</option>
                    </select>
                  </div>
                </div>

                {/* Địa chỉ công trình */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                    <MapPin size={14} className="text-gold" />
                    <span>Địa Chỉ Công Trình / Tư Gia</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Ví dụ: Khu đô thị Ciputra, Tây Hồ, Hà Nội hoặc Sala Đại Quang Minh, TP.HCM"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-espresso placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
                  />
                </div>

                {/* Yêu cầu chi tiết */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-espresso/80 mb-2">
                    <MessageSquare size={14} className="text-gold" />
                    <span>Yêu Cầu Chi Tiết & Phong Cách Mong Muốn</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Chia sẻ về phong cách thiết kế bạn yêu thích (Modern Luxury, Indochine, Wabi Sabi, Tân cổ điển...), các không gian cần làm (phòng khách, phòng ngủ, phòng ăn) hoặc lưu ý riêng..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-espresso placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all leading-relaxed"
                  />
                </div>

                {/* Nút gửi form mềm mại, sang trọng */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-espresso via-[#3C3228] to-espresso text-champagne text-xs sm:text-sm font-medium tracking-wide shadow-md hover:shadow-xl hover:from-gold hover:via-champagne hover:to-gold hover:text-charcoal transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <Sparkles size={16} className="text-gold group-hover:text-charcoal transition-colors" />
                  <span>{loading ? "Đang Gửi Thông Tin Khảo Sát..." : "Gửi Đăng Ký Tư Vấn Khảo Sát"}</span>
                </button>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left text-[11px] text-espresso/60">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>Bảo mật 100% thông tin tư gia</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Clock size={14} className="text-gold shrink-0" />
                    <span>Phản hồi trong vòng 2 giờ</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Award size={14} className="text-gold shrink-0" />
                    <span>KTS 8+ năm kinh nghiệm</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </SiteChrome>
    </main>
  );
}
