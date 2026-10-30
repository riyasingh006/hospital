import { LandingHeader } from "@/components/home/landing-header";
import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { WhyChoose } from "@/components/home/why-choose";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-banner";
import { TrustStrip } from "@/components/home/trust-strip";

export default function HomePage() {
  return (
    <>
      <LandingHeader />
      <main id="main-content">
        <Hero />
        <StatsBar />
        <WhyChoose />
        <HowItWorks />
        <Testimonials />
        <CtaBanner />
      </main>
      <TrustStrip />
    </>
  );
}
