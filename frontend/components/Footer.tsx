// components/Footer.tsx — THAY TOÀN BỘ FILE NÀY
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Instagram, Facebook, Youtube, ArrowRight, Mail, Phone, MapPin } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Bộ Sưu Tập",
    links: [
      { label: "Phòng Khách", href: "/collections/living-room" },
      { label: "Phòng Ngủ", href: "/collections/bedroom" },
      { label: "Phòng Ăn", href: "/collections/dining" },
      { label: "Chiếu Sáng", href: "/collections/lighting" },
    ],
  },
  {
    heading: "Dịch Vụ",
    links: [
      { label: "Đặt Riêng Theo Yêu Cầu", href: "/collections/bespoke" },
      { label: "Tư Vấn Thiết Kế", href: "#" },
      { label: "White-Glove Delivery", href: "#" },
      { label: "Bảo Hành", href: "#" },
    ],
  },
  {
    heading: "Thương Hiệu",
    links: [
      { label: "Câu Chuyện GS Luxury", href: "/#heritage" },
      { label: "Showroom", href: "#" },
      { label: "Tuyển Dụng", href: "#" },
      { label: "Liên Hệ", href: "#" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <footer id="bespoke" className="bg-charcoal text-beige">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-20">
        <div className="grid md:grid-cols-2 gap-12 pb-16 border-b hairline-light">
          <div>
            <h3 className="font-serif text-3xl md:text-4xl max-w-md text-balance">
              Nhận Thông Tin Bộ Sưu Tập Mới Nhất
            </h3>
            <p className="text-beige/50 text-sm mt-4 max-w-sm">
              Đăng ký để nhận ưu đãi độc quyền và cập nhật sớm nhất từ GS
              Luxury.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center"
          >
            {submitted ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gold text-sm"
              >
                Cảm ơn bạn đã đăng ký. Hẹn gặp lại trong hộp thư của bạn.
              </motion.p>
            ) : (
              <div className="flex items-end gap-4 border-b border-beige/30 pb-3 focus-within:border-gold transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Địa chỉ email của bạn"
                  className="flex-1 bg-transparent outline-none placeholder:text-beige/40 text-base"
                />
                <button
                  type="submit"
                  aria-label="Đăng ký nhận bản tin"
                  className="p-2 hover:text-gold transition-colors focus-ring"
                >
                  <ArrowRight strokeWidth={1.5} size={22} />
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-16">
          <div className="lg:col-span-2">
            <span className="font-serif text-2xl font-bold tracking-wider text-champagne">
              GS LUXURY
            </span>
            <p className="text-beige/60 text-xs mt-3 leading-relaxed max-w-sm">
              Thương hiệu nội thất cao cấp thượng lưu, kiến tạo không gian sống vượt thời gian bằng nghệ thuật thủ công tinh hoa và vật liệu thượng hạng.
            </p>

            <div className="mt-5 space-y-2 text-xs text-beige/70">
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-gold shrink-0" />
                <span>Email CSKH: <a href="mailto:Dangnamson24@gmail.com" className="text-champagne font-mono hover:text-gold transition-colors">Dangnamson24@gmail.com</a> / <span className="text-champagne font-mono">concierge@gsluxury.vn</span></span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-gold shrink-0" />
                <span>Hotline: <strong className="text-champagne font-mono">1900 8888</strong> (08:00 - 22:00 Hàng ngày)</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                <span>Showroom HCM: Tầng 3, Diamond Plaza, 34 Lê Duẩn, Bến Nghé, Quận 1</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                <span>Showroom Hà Nội: Trường đại học Tài nguyên và môi trường Hà Nội, Phú diễn, Bắc từ liêm, Hà Nội</span>
              </p>
            </div>

            <div className="flex items-center gap-3.5 mt-6">
              <a
                href="https://www.facebook.com/giang.son.114064"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook GS Luxury"
                title="Facebook: Giang Sơn"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-beige/80 hover:text-white hover:bg-[#1877F2]/20 hover:border-[#1877F2]/60 hover:shadow-[0_0_12px_rgba(24,119,242,0.3)] transition-all duration-300 focus-ring"
              >
                <Facebook strokeWidth={1.5} size={16} />
              </a>
              <a
                href="https://www.instagram.com/nhimsthongthai/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram GS Luxury"
                title="Instagram: @nhimsthongthai"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-beige/80 hover:text-white hover:bg-gradient-to-tr hover:from-[#F58529]/20 hover:via-[#DD2A7B]/20 hover:to-[#8134AF]/20 hover:border-[#DD2A7B]/60 hover:shadow-[0_0_12px_rgba(221,42,123,0.3)] transition-all duration-300 focus-ring"
              >
                <Instagram strokeWidth={1.5} size={16} />
              </a>
              <a
                href="https://www.youtube.com/@kenjiac1413"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Youtube GS Luxury"
                title="Youtube: @kenjiac1413"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-beige/80 hover:text-white hover:bg-[#FF0000]/20 hover:border-[#FF0000]/60 hover:shadow-[0_0_12px_rgba(255,0,0,0.3)] transition-all duration-300 focus-ring"
              >
                <Youtube strokeWidth={1.5} size={16} />
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-4">
                {group.heading}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-beige/70 hover:text-gold transition-colors focus-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t hairline-light flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-beige/40">
          <p>© {new Date().getFullYear()} GS Luxury. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold transition-colors">
              Chính Sách Bảo Mật
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              Điều Khoản Dịch Vụ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
