import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import SettlementModal from '../components/SettlementModal';

const transactions = [
  { type: 'Delivery completed', time: '2:15 PM', amount: '+₦1,250' },
  { type: 'Delivery completed', time: '1:42 PM', amount: '+₦980' },
  { type: 'Delivery completed', time: '12:30 PM', amount: '+₦1,100' },
  { type: 'Delivery completed', time: '11:05 AM', amount: '+₦870' },
  { type: 'Delivery completed', time: '9:50 AM', amount: '+₦300' },
];

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="ml-[280px] flex-1 p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] font-bold text-[#1F2937]">Dashboard</h1>
          <p className="text-[14px] text-[#6B7280]">Monday, July 3rd, 2026 | 2:34 PM</p>
        </div>

        {/* Balance Card */}
        <div className="bg-[#2563EB] rounded-lg p-8 flex items-center justify-between mb-6 shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
          <div>
            <p className="text-[12px] font-medium text-white/90 mb-1">Available Balance</p>
            <p className="text-[36px] font-bold text-white mb-1">₦12,450</p>
            <p className="text-[12px] text-white/80">Updated 2 minutes ago</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#10B981] text-white px-8 py-3 text-[14px] font-semibold rounded hover:bg-[#059669] cursor-pointer transition-colors"
          >
            Settle Now
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Today's Earnings</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">₦4,500</p>
            <p className="text-[12px] text-[#10B981]">+₦1,200 from yesterday</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Pending Payouts</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">₦0</p>
            <p className="text-[12px] text-[#10B981]">All settled</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">This Week's Total</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">₦28,750</p>
            <p className="text-[12px] text-[#6B7280]">7 days of work</p>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-4">Today's Activity</p>
          {transactions.map((t, i) => (
            <div key={i} className={`flex items-center justify-between py-3 ${i < transactions.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
              <span className="text-[14px] text-[#1F2937]">{t.type}</span>
              <span className="text-[14px] text-[#6B7280]">{t.time}</span>
              <span className="text-[14px] text-[#10B981] font-medium">{t.amount}</span>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-bold text-[#1F2937]">Your Payment Methods</p>
            <button className="text-[14px] text-[#2563EB] cursor-pointer hover:underline">Edit</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-[#1F2937]">Guaranty Trust Bank (GTB)</p>
              <p className="text-[14px] text-[#6B7280]">**** **** **** 5678 · Chioma Adeyemi</p>
            </div>
            <span className="bg-[#2563EB] text-white text-[12px] px-2 py-1 rounded">Primary account</span>
          </div>
        </div>
      </main>

      {showModal && <SettlementModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
