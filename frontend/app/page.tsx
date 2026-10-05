import SiteChrome from "@/components/SiteChrome";
import Hero from "@/components/Hero";
import VirtualRoomStudio from "@/components/VirtualRoomStudio";
import FlashSaleSection from "@/components/FlashSaleSection";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Lookbook from "@/components/Lookbook";
import CollectionsGrid from "@/components/CollectionsGrid";
import Heritage from "@/components/Heritage";
import Testimonials from "@/components/Testimonials";
import ShowroomAmbientAudio from "@/components/ShowroomAmbientAudio";
import GoldCursorGlow from "@/components/GoldCursorGlow";

export default function Home() {
  return (
    <main className="min-h-screen bg-beige">
      <GoldCursorGlow />
      <ShowroomAmbientAudio />
      <SiteChrome>
        <Hero />
        <VirtualRoomStudio />
        <section className="py-12 md:py-16 max-w-[1360px] mx-auto px-6">
          <BeforeAfterSlider
            beforeImage="/images/staged/penthouse_before.jpg"
            afterImage="/images/staged/penthouse_after.jpg"
            roomTitle="Phòng Khách Penthouse Hoàng Gia"
            styleName="Modern Italian Luxury"
          />
        </section>
        <CollectionsGrid />
        <Heritage />
        <Testimonials />
      </SiteChrome>
    </main>
  );
}
