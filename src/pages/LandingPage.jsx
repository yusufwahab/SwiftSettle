import { useNavigate } from 'react-router-dom';
import UnsplashImage from '../components/UnsplashImage';

const steps = [
  { num: '01', heading: 'Worker logs in', desc: 'Simple mobile or web login. One-time setup of your bank account.', query: 'step1', imgRight: true },
  { num: '02', heading: 'Earnings accumulate in real-time', desc: 'As you complete deliveries, your balance updates instantly. No waiting for end-of-day reconciliation.', query: 'step2', imgRight: false },
  { num: '03', heading: "Tap 'Cash Out Now'", desc: 'One button. Any time. Your money settles to your bank account within minutes.', query: 'step3', imgRight: true },
  { num: '04', heading: 'Confirmation & Receipt', desc: 'Push notification + SMS confirmation. Your money is there. You\'re done.', query: 'step4', imgRight: false },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-[#1F2937]">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#E5E7EB] px-10 py-4 flex items-center justify-between sticky top-0 z-50">
        <span className="text-[20px] font-bold text-[#2563EB]">SwiftSettle</span>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-[14px] text-[#6B7280] hover:text-[#1F2937]">How it Works</a>
          <a href="#solution" className="text-[14px] text-[#6B7280] hover:text-[#1F2937]">Solution</a>
          <button onClick={() => navigate('/login')} className="text-[14px] text-[#6B7280] hover:text-[#1F2937] cursor-pointer">Sign In</button>
          <button onClick={() => navigate('/signup')} className="bg-[#2563EB] text-white text-[14px] px-4 py-2 hover:bg-[#1D4ED8] cursor-pointer">Get Started</button>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="bg-white py-[60px] px-10 flex min-h-[calc(100vh-65px)]">
        <div className="flex-1 flex flex-col justify-center pr-10 max-w-[50%]">
          <h1 className="text-[48px] font-bold leading-[1.2] text-[#1F2937] mb-5">Real-Time Earnings for Every Gig Worker</h1>
          <p className="text-[16px] text-[#374151] mb-8 leading-[1.5]">Stop waiting days for your money. Get paid instantly. SwiftSettle powers the settlement layer for Nigeria's gig economy.</p>
          <div className="flex items-center gap-5 mb-5">
            <button onClick={() => navigate('/signup')} className="bg-[#2563EB] text-white px-8 py-3 text-[16px] font-medium hover:bg-[#1D4ED8] cursor-pointer">Start Settling Now</button>
          </div>
          <p className="text-[14px] text-[#6B7280]">Join 10,000+ workers earning on their terms</p>
        </div>
        <div className="flex-1 max-w-[50%]">
          <UnsplashImage query="heroRight" className="w-full h-full object-cover" alt="Gig worker with phone" />
        </div>
      </section>

      {/* Section 2: The Problem */}
      <section className="bg-[#F9FAFB] py-[80px] px-10">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-[32px] font-bold mb-3">The Problem is Real</h2>
          <p className="text-[16px] text-[#6B7280]">15 million Nigerian gig workers face the same barrier every day</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
          {[
            { num: '3-7 DAYS', label: 'Average payment delay', desc: 'Workers wait a week to access earnings they need today' },
            { num: '20-30%', label: 'Interest on emergency loans', desc: 'Forced to borrow at predatory rates just to survive the wait' },
            { num: '40%', label: 'Platform attrition rate', desc: 'Workers switch platforms chasing faster payouts' },
          ].map(({ num, label, desc }) => (
            <div key={num} className="bg-[#F3F4F6] p-8 shadow-[0_4px_6px_rgba(0,0,0,0.07)]">
              <p className="text-[36px] font-bold text-[#2563EB] mb-2">{num}</p>
              <p className="text-[16px] font-semibold text-[#1F2937] mb-2">{label}</p>
              <p className="text-[14px] text-[#6B7280]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Problem Story */}
      <section className="bg-white py-[80px] px-10">
        <div className="max-w-5xl mx-auto flex gap-12 items-center">
          <div className="flex-1">
            <UnsplashImage query="problemStory" className="w-full h-[400px] object-cover" alt="Delivery rider stressed" />
          </div>
          <div className="flex-1">
            <h2 className="text-[32px] font-bold mb-5">Meet Chioma</h2>
            <p className="text-[16px] text-[#374151] leading-[1.7] whitespace-pre-line mb-5">{`Chioma completes 25 deliveries on Monday, earning ₦12,500.

But she can't pay her rent. The platform doesn't settle until Friday. So she borrows ₦10,000 at 25% interest to cover this week's expenses.

By Friday, she's earned less after interest than if she'd just waited. This happens every week.

She's not struggling because deliveries aren't profitable. She's struggling because payment delays force her into debt.`}</p>
            <button onClick={() => navigate('/signup')} className="text-[#2563EB] text-[16px] hover:underline cursor-pointer">This is why SwiftSettle exists →</button>
          </div>
        </div>
      </section>

      {/* Section 4: Solution */}
      <section id="solution" className="bg-[#F9FAFB] py-[80px] px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-bold mb-3">Introducing SwiftSettle</h2>
            <p className="text-[16px] text-[#6B7280]">Instant settlement. Built on Nomba. For everyone.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { heading: 'Real-Time Earnings', desc: 'See your balance update live as orders complete. No refresh. No delay. Just instant visibility.', query: 'solutionDashboard' },
              { heading: 'Instant Settlement', desc: "Hit 'Cash Out Now' and your money transfers to your bank within minutes. Same day. Every time.", query: 'solutionPayment' },
              { heading: 'Platform Loyalty', desc: 'Workers stop chasing other platforms. Platforms reduce attrition by 30%. Everyone wins.', query: 'solutionTeam' },
            ].map(({ heading, desc, query }) => (
              <div key={heading} className="bg-white border border-[#E5E7EB]">
                <UnsplashImage query={query} className="w-full h-[200px] object-cover" alt={heading} />
                <div className="p-5">
                  <h3 className="text-[16px] font-semibold text-[#1F2937] mb-2">{heading}</h3>
                  <p className="text-[16px] text-[#374151]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: How It Works */}
      <section id="how" className="bg-white py-[80px] px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[32px] font-bold text-center mb-16">How SwiftSettle Works</h2>
          <div className="flex flex-col gap-16">
            {steps.map(({ num, heading, desc, query, imgRight }) => (
              <div key={num} className={`flex items-center gap-12 ${!imgRight ? 'flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <p className="text-[64px] font-bold text-[#E5E7EB] leading-none mb-2">{num}</p>
                  <h3 className="text-[24px] font-bold text-[#1F2937] mb-3">{heading}</h3>
                  <p className="text-[16px] text-[#6B7280]">{desc}</p>
                </div>
                <div className="flex-1">
                  <UnsplashImage query={query} className="w-full h-[300px] object-cover border border-[#E5E7EB]" alt={heading} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Why Nomba */}
      <section className="bg-[#F9FAFB] py-[80px] px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-12">
          <div>
            <h2 className="text-[28px] font-bold text-[#374151] mb-2">Built on Nomba</h2>
            <p className="text-[16px] text-[#6B7280] mb-4">Infrastructure that scales</p>
            <p className="text-[16px] text-[#374151] mb-5">SwiftSettle uses Nomba's Virtual Accounts, Transfers API, and Webhooks to power instant settlements. Nomba's infrastructure is proven, secure, and built for African fintech.</p>
            {['Virtual Accounts track earnings per worker', 'Transfers API settles money same-day', 'Webhooks automate the entire flow', 'No custom payment infrastructure needed'].map(t => (
              <p key={t} className="text-[14px] text-[#374151] mb-2">— {t}</p>
            ))}
          </div>
          <div>
            <h2 className="text-[28px] font-bold text-[#374151] mb-2">The Platform Layer</h2>
            <p className="text-[16px] text-[#6B7280] mb-4">We do the hard work</p>
            <p className="text-[16px] text-[#374151] mb-5">Nomba handles payments. SwiftSettle handles the user experience, reconciliation, worker management, and platform integration.</p>
            {['Frictionless worker onboarding', 'Real-time earnings visibility', 'Automatic reconciliation', 'Platform admin dashboard'].map(t => (
              <p key={t} className="text-[14px] text-[#374151] mb-2">— {t}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Market Size */}
      <section className="bg-white py-[80px] px-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-[32px] font-bold mb-16">The Opportunity</h2>
          <div className="flex justify-center gap-[100px]">
            {[
              { num: '15M+', desc: 'Gig workers in Nigeria waiting for real-time settlement', sub: 'And growing 25% annually' },
              { num: '₦500B+', desc: 'Annual economic impact of payment delays', sub: "Estimated cost to Nigeria's gig economy" },
              { num: '30%', desc: 'Estimated reduction in platform attrition', sub: 'When workers get paid same-day' },
            ].map(({ num, desc, sub }) => (
              <div key={num} className="flex-1 max-w-[220px]">
                <p className="text-[48px] font-bold text-[#2563EB] mb-3">{num}</p>
                <p className="text-[16px] text-[#1F2937] mb-2">{desc}</p>
                <p className="text-[14px] text-[#6B7280]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: CTA */}
      <section className="bg-[#1F2937] py-[80px] px-10 text-center">
        <h2 className="text-[32px] font-bold text-white mb-3">Ready to stop waiting?</h2>
        <p className="text-[16px] text-gray-300 mb-8">Join the settlement revolution</p>
        <div className="flex justify-center gap-5">
          <button onClick={() => navigate('/signup')} className="border border-white text-white px-8 py-3 text-[14px] hover:bg-white hover:text-[#1F2937] cursor-pointer transition-colors">Start as a Worker</button>
          <button className="border border-white text-white px-8 py-3 text-[14px] hover:bg-white hover:text-[#1F2937] cursor-pointer transition-colors">Integrate for Your Platform</button>
        </div>
      </section>

      {/* Section 9: Footer */}
      <footer className="bg-[#F9FAFB] px-10 pt-[60px] pb-8">
        <div className="max-w-5xl mx-auto grid grid-cols-4 gap-8 mb-10">
          {[
            { heading: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap'] },
            { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { heading: 'Resources', links: ['Documentation', 'API Docs', 'Support', 'Status'] },
            { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-[14px] font-bold text-[#1F2937] mb-4">{heading}</p>
              {links.map(l => <a key={l} href="#" className="block text-[14px] text-[#6B7280] mb-2 hover:text-[#1F2937]">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="border-t border-[#E5E7EB] pt-6 text-center">
          <p className="text-[14px] text-[#6B7280]">© 2026 SwiftSettle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
