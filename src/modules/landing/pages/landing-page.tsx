import { Navigation } from "@/shared/components/navigation"
import { HeroSection } from "@/shared/components/hero-section"
import { MeetingsSection } from "@/shared/components/meetings-section"
import { ContentSection } from "@/shared/components/content-section"
import { AboutSection } from "@/shared/components/about-section"
import { ValuesSection } from "@/shared/components/values-section"
import { ContactSection } from "@/shared/components/contact-section"
import { Footer } from "@/shared/components/footer"

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <MeetingsSection />
      <ContentSection />
      <AboutSection />
      <ValuesSection />
      <ContactSection />
      <Footer />
    </main>
  )
}

