import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const settlements = [
  { date: '3 Jul 2026', time: '2:34 PM', amount: '₦5,000', ref: 'SW-2026-001234', status: 'Completed' },
  { date: '2 Jul 2026', time: '11:20 AM', amount: '₦8,750', ref: 'SW-2026-001233', status: 'Completed' },
  { date: '1 Jul 2026', time: '4:05 PM', amount: '₦3,200', ref: 'SW-2026-001232', status: 'Completed' },
  { date: '30 Jun 2026', time: '9:15 AM', amount: '₦6,500', ref: 'SW-2026-001231', status: 'Pending' },
  { date: '29 Jun 2026', time: '3:50 PM', amount: '₦4,100', ref: 'SW-2026-001230', status: 'Failed' },
  { date: '28 Jun 2026', time: '1:30 PM', amount: '₦7,200', ref: 'SW-2026-001229', status: 'Completed' },
];

const statusStyle = {
  Completed: 'bg-[#D1FAE5] text-[#065F46]',
  Pending: 'bg-[#FEF3C7] text-[#92400E]',
  Failed: 'bg-[#FEE2E2] text-[#7F1D1D]',
};

export default function SettlementsPage() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = settlements.filter(s =>
    (statusFilter === 'All' || s.status === statusFilter) &&
    (s.ref.toLowerCase().includes(search.toLowerCase()) || s.amount.includes(search))
  );

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="ml-[280px] flex-1 p-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1F2937]">Settlements</h1>
          <p className="text-[14px] text-[#6B7280]">View all your past and pending payouts</p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div>
            <label className="block text-[12px] text-[#6B7280] mb-1">Date Range</label>
            <input type="text" defaultValue="Last 30 days" className="border border-[#D1D5DB] bg-white px-3 py-2 text-[14px] rounded focus:outline-none" />
          </div>
          <div>
            <label className="block text-[12px] text-[#6B7280] mb-1">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-[#D1D5DB] bg-white px-3 py-2 text-[14px] rounded focus:outline-none">
              {['All', 'Completed', 'Pending', 'Failed'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[12px] text-[#6B7280] mb-1">Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by reference or amount" className="w-full border border-[#D1D5DB] bg-white px-3 py-2 text-[14px] rounded focus:outline-none" />
          </div>
          <button onClick={() => { setStatusFilter('All'); setSearch(''); }} className="text-[14px] text-[#2563EB] mt-5 cursor-pointer hover:underline">Reset Filters</button>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-x-auto mb-6">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-[#F3F4F6] text-[#1F2937] font-bold">
                {['Date', 'Time', 'Amount', 'Reference', 'Status', 'Receipt'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.ref} className={`border-b border-[#E5E7EB] ${i % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white'}`}>
                  <td className="px-4 py-3">{s.date}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{s.time}</td>
                  <td className="px-4 py-3 font-medium">{s.amount}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{s.ref}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] font-medium px-2 py-1 rounded ${statusStyle[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[#2563EB] text-[14px] cursor-pointer hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Total Settled (30 days)</p>
            <p className="text-[24px] font-bold text-[#1F2937]">₦86,250</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Pending Settlements</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">₦0</p>
            <p className="text-[12px] text-[#10B981]">None pending</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Settlements Count</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">23</p>
            <p className="text-[12px] text-[#6B7280]">transactions</p>
          </div>
        </div>
      </main>
    </div>
  );
}
