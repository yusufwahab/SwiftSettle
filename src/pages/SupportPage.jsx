import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const faqs = {
  'Getting Started': [
    { q: 'How do I create an account?', a: 'Visit our signup page and fill in your personal details, bank information, and verify your phone number with an OTP.' },
    { q: 'How do I link my bank account?', a: 'During signup, enter your bank account number and select your bank from the dropdown. You can also update this in Settings.' },
    { q: 'What information do I need to sign up?', a: 'You need your full name, email, phone number, date of birth, and bank account details.' },
  ],
  'Earnings & Settlements': [
    { q: 'How do earnings appear on my dashboard?', a: 'Earnings update in real-time as you complete deliveries. Your balance reflects immediately after each order.' },
    { q: 'When are earnings settled?', a: 'You can settle any time you want. Click "Settle Now" on your dashboard and funds arrive within minutes.' },
    { q: 'Can I settle whenever I want?', a: 'Yes! SwiftSettle allows on-demand settlement 24/7. There are no restrictions on when you can cash out.' },
  ],
};

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E5E7EB] rounded mb-2">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-4 bg-[#F9FAFB] text-left cursor-pointer hover:bg-[#F3F4F6]">
        <span className="text-[14px] font-medium text-[#1F2937]">{q}</span>
        <span className={`text-[#6B7280] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="px-4 py-4 bg-white text-[14px] text-[#6B7280]">{a}</div>}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="ml-[280px] flex-1 p-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1F2937]">Help & Support</h1>
          <p className="text-[14px] text-[#6B7280]">Get answers to your questions</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">🔍</span>
          <input
            placeholder="Search for answers... (e.g., 'How do I settle my earnings?')"
            className="w-full border border-[#D1D5DB] pl-10 pr-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#2563EB] bg-white"
          />
        </div>

        {/* Popular Questions */}
        <p className="text-[14px] font-bold text-[#1F2937] mb-4">Popular Questions</p>
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[
            { title: 'How do I settle my earnings?', cat: 'Settlements', excerpt: 'Learn how to withdraw your earnings in minutes...' },
            { title: 'How do I update my bank account?', cat: 'Account', excerpt: 'Change your bank details or add a new account...' },
            { title: 'Why is my settlement pending?', cat: 'Troubleshooting', excerpt: 'Understand why your settlement might be delayed...' },
          ].map(({ title, cat, excerpt }) => (
            <div key={title} className="bg-white border border-[#E5E7EB] p-5 rounded hover:border-[#2563EB] transition-colors cursor-pointer">
              <span className="text-[12px] bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded mb-3 inline-block">{cat}</span>
              <p className="text-[14px] font-semibold text-[#1F2937] mb-2">{title}</p>
              <p className="text-[14px] text-[#6B7280] mb-3">{excerpt}</p>
              <button className="text-[14px] text-[#2563EB] hover:underline cursor-pointer">Read More</button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <p className="text-[14px] font-bold text-[#1F2937] mb-4">Frequently Asked Questions</p>
        <div className="grid grid-cols-2 gap-6 mb-8">
          {Object.entries(faqs).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[14px] font-semibold text-[#1F2937] mb-3">{cat}</p>
              {items.map(item => <AccordionItem key={item.q} {...item} />)}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-6">Still need help?</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '✉', title: 'Email Us', detail: 'support@swiftsettle.app', sub: '24 hours response' },
              { icon: '💬', title: 'Live Chat', detail: 'Available', sub: 'Mon-Fri, 9 AM - 6 PM', green: true },
              { icon: '📞', title: 'Call Us', detail: '+234 800 SETTLE (735835)', sub: 'Mon-Fri, 9 AM - 5 PM' },
            ].map(({ icon, title, detail, sub, green }) => (
              <div key={title} className="text-center p-5 rounded hover:bg-[#F9FAFB] cursor-pointer transition-colors">
                <p className="text-3xl mb-3">{icon}</p>
                <p className="text-[14px] font-semibold text-[#1F2937] mb-1">{title}</p>
                <p className={`text-[14px] mb-1 ${green ? 'text-[#10B981]' : 'text-[#6B7280]'}`}>{detail}</p>
                <p className="text-[12px] text-[#6B7280]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
