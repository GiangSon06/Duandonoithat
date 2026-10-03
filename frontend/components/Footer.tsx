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
                <span>Email CSKH: <strong className="text-champagne font-mono">contact@gsluxury.vn</strong> / <strong className="text-champagne font-mono">concierge@gsluxury.vn</strong></span>
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
                <span>Showroom Hà Nội: 68 Tràng Tiền, Hoàn Kiếm, Hà Nội</span>
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:text-gold hover:border-gold transition-colors focus-ring"
              >
                <Instagram strokeWidth={1.5} size={16} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:text-gold hover:border-gold transition-colors focus-ring"
              >
                <Facebook strokeWidth={1.5} size={16} />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:text-gold hover:border-gold transition-colors focus-ring"
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
