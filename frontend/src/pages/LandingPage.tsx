import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import CopilotShowcase from '@/components/landing/CopilotShowcase';
import HowItWorks from '@/components/landing/HowItWorks';
import TrustSafety from '@/components/landing/TrustSafety';
import FinalCta from '@/components/landing/FinalCta';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main>
        <Hero />
        <CopilotShowcase />
        <HowItWorks />
        <TrustSafety />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
