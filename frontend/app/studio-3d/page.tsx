import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import InteractiveRoom3DStudio from "@/components/InteractiveRoom3DStudio";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShowroomAmbientAudio from "@/components/ShowroomAmbientAudio";
import GoldCursorGlow from "@/components/GoldCursorGlow";
import Link from "next/link";
import { Sparkles, ArrowRight, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "3D Virtual Studio — Phối Cảnh Không Gian Đa Chiều | GS Luxury",
  description:
    "Trải nghiệm Studio 3D độc quyền của GS Luxury: Tùy biến vật liệu, đổi 4 chế độ ánh sáng real-time và tính toán ngân sách hoàn thiện dinh thự.",
};

export default function Studio3DPage() {
  return (
    <main className="min-h-screen bg-charcoal text-beige selection:bg-gold selection:text-charcoal">
      <GoldCursorGlow />
      <ShowroomAmbientAudio />
      <SiteChrome>
        <section className="py-12 md:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-mono uppercase tracking-widest2">
              <Sparkles size={14} className="text-gold animate-spin" />
              <span>LIVE 3D WEBGL STUDIO • TỶ LỆ 1:1</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl text-champagne leading-tight">
              Studio Không Gian 3D Trực Quan Tương Tác
            </h1>
            <p className="text-xs sm:text-sm text-beige/70 font-light max-w-2xl mx-auto leading-relaxed">
              Tự do xoay 360°, đổi góc camera, thay đổi 3 chế độ ánh sáng quang học và bấm vào từng món đồ nội thất 3D để khám phá bóc tách kỹ thuật.
            </p>
          </div>

          {/* Primary 3D WebGL Studio */}
          <InteractiveRoom3DStudio
            roomType="Phòng Khách Penthouse Hoàng Gia"
            styleName="Modern Italian Luxury"
            roomArea="42"
          />

          {/* Secondary Draggable Before / After Staging Viewer */}
          <div className="pt-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
                  <span className="text-[11px] font-mono uppercase tracking-widest2 text-gold font-semibold">
                    Hiện Trạng &amp; Hoàn Thiện
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-champagne font-normal">
                  So Sánh Quang Học: Trước &amp; Sau Khi Lên Đồ
                </h3>
              </div>
              <Link
                href="/ai-stylist"
                className="px-4 py-2 rounded-xl bg-gold/15 border border-gold/40 text-gold hover:bg-gold hover:text-charcoal text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Compass size={14} />
                <span>Tải Ảnh Phòng Của Bạn Lên AI</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <BeforeAfterSlider
              beforeImage="/images/staged/penthouse_before.jpg"
              afterImage="/images/staged/penthouse_after.jpg"
              roomTitle="Phòng Khách Penthouse Hoàng Gia"
              styleName="Modern Italian Luxury"
            />
          </div>
        </section>
      </SiteChrome>
    </main>
  );
}
