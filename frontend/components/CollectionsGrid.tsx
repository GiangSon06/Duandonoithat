// components/CollectionsGrid.tsx — THAY TOÀN BỘ FILE NÀY
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { collections, getFeaturedProducts } from "@/lib/products";
import ProductCard from "./ProductCard";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const COLLECTION_META: Record<string, { tag: string; desc: string }> = {
  "living-room": {
    tag: "HAUTE LIVING",
    desc: "Sofa da bò Ý & Bàn trà chạm khắc thủ công",
  },
  "bedroom": {
    tag: "MASTER SUITE",
    desc: "Giường ngủ vòm hoàng gia & Tủ áo thượng lưu",
  },
  "dining": {
    tag: "GRAND BANQUET",
    desc: "Bàn tiệc cẩm thạch & Ghế bọc nhung dệt cao cấp",
  },
  "lighting": {
    tag: "ARTISANAL LIGHTING",
    desc: "Gương nghệ thuật & Đèn chùm pha lê tinh xảo",
  },
  "kitchen": {
    tag: "CULINARY ATELIER",
    desc: "Đảo bếp đá tự nhiên & Tủ bếp gỗ óc chó quý",
  },
  "bespoke": {
    tag: "BESPOKE SERVICE",
    desc: "Chế tác độc bản theo kiến trúc riêng của gia chủ",
  },
};

export default function CollectionsGrid() {
  // Trang chủ chỉ hiển thị sản phẩm nổi bật (featured: true trong lib/products.ts)
  const featured = getFeaturedProducts(4);

  return (
    <section id="collections" className="py-24 md:py-32 px-6 bg-beige">
      <div className="mx-auto max-w-[1440px]">
        {/* Header cân đối, chuẩn thiết kế tạp chí kiến trúc thượng lưu */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px] font-medium tracking-widest2 uppercase mb-4 shadow-xs">
            <Sparkles size={12} />
            <span>Bộ Sưu Tập Tuyển Chọn</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-espresso text-balance leading-tight">
            Từng Món Đồ, Một Câu Chuyện Thủ Công
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-4.5" />
          <p className="text-espresso/70 text-sm md:text-base leading-relaxed">
            Mỗi tuyệt tác được chế tác bởi nghệ nhân hàng đầu, sử dụng chất liệu tự nhiên thượng hạng — từ da Ý nguyên tấm, đá cẩm thạch tự nhiên đến gỗ óc chó quý hiếm.
          </p>
        </div>

        {/* Lưới danh mục 3 cột đối xứng, thuận mắt, bo góc mềm mại chuẩn Luxury */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7 mb-24">
          {collections.map((col, i) => {
            const meta = COLLECTION_META[col.id] || {
              tag: "EXCLUSIVE",
              desc: "Bộ sưu tập nội thất cao cấp",
            };
            return (
              <motion.div
                key={col.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{
                  duration: 0.6,
                  delay: i * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative block w-full aspect-[4/5] rounded-3xl overflow-hidden border border-espresso/10 hover:border-gold/60 shadow-sm hover:shadow-2xl transition-all duration-500 bg-espresso/5"
              >
                <Link
                  href={`/collections/${col.id}`}
                  className="block w-full h-full relative"
                >
                  <Image
                    src={col.image}
                    alt={col.label}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Luxury Multi-layer Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/25 to-black/5 transition-opacity duration-500 group-hover:from-charcoal/95" />

                  {/* Top Tag Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur-md border border-gold/30 text-champagne text-[10px] tracking-widest font-serif uppercase rounded-full shadow-xs">
                      <Sparkles size={11} className="text-gold" />
                      {meta.tag}
                    </span>
                  </div>

                  {/* Bottom Floating Glassmorphism Card */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 p-4 md:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:border-gold/50 group-hover:bg-white/15 transition-all duration-500">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-xl md:text-2xl text-champagne font-medium group-hover:text-gold transition-colors duration-300">
                          {col.label}
                        </h3>
                        <p className="text-xs text-beige/80 mt-1 line-clamp-1">
                          {meta.desc}
                        </p>
                      </div>
                      <span className="w-9 h-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-charcoal group-hover:scale-110 transition-all duration-300 shrink-0 shadow-xs">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Sản phẩm nổi bật — chỉ hiện số lượng giới hạn, xem thêm dẫn sang trang riêng */}
        <div className="flex items-end justify-between mb-10">
          <h3 className="font-serif text-2xl md:text-3xl">Sản Phẩm Nổi Bật</h3>
          <Link
            href="/collections"
            className="hidden md:flex items-center gap-2 text-xs tracking-widest2 uppercase hover:text-gold transition-colors focus-ring"
          >
            Xem Tất Cả Sản Phẩm
            <ArrowRight strokeWidth={1.5} size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              transition={{
                duration: 0.6,
                delay: (i % 4) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex justify-center md:hidden">
          <Link
            href="/collections"
            className="flex items-center gap-2 text-xs tracking-widest2 uppercase border border-espresso/20 px-8 py-4 hover:border-gold hover:text-gold transition-colors duration-300"
          >
            Xem Tất Cả Sản Phẩm
            <ArrowRight strokeWidth={1.5} size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
