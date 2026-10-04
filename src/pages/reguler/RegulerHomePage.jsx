import React from "react"
import Hero from "../../components/reguler/Hero"
import HighlightSection from "../../components/reguler/HighlightSection"
import PsychologistCard from "../../components/reguler/PsychologistCard"
import TestimonialCarousel from "../../components/reguler/TestimonialCarousel"
import FAQSection from "../../components/reguler/FAQSection"
import FooterInfo from "../../components/common/FooterInfo"

export default function RegulerHomePage() {
  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Hero />
      <HighlightSection />
      <PsychologistCard />
      <TestimonialCarousel />
      <FAQSection />
      <FooterInfo />
    </div>
  )
}
