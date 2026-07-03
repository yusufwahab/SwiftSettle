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
    <div>
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
