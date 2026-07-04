import LandingNav from "./landing/LandingNav";
import Hero from "./landing/Hero";
import Problem from "./landing/Problem";
import Story from "./landing/Story";
import Solution from "./landing/Solution";
import HowItWorks from "./landing/HowItWorks";
import WhyNomba from "./landing/WhyNomba";
import MarketSize from "./landing/MarketSize";
import FinalCta from "./landing/FinalCta";
import Footer from "./landing/Footer";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-appbg">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-[900px] h-[420px] w-[420px] rounded-full bg-accent-2/12 blur-[130px]"
      />
      <LandingNav />
      <Hero />
      <Problem />
      <Story />
      <Solution />
      <HowItWorks />
      <WhyNomba />
      <MarketSize />
      <FinalCta />
      <Footer />
    </div>
  );
}
