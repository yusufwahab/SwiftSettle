import Sidebar from '../components/Sidebar';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

const weeklyData = [
  { day: 'Mon', amount: 3200 },
  { day: 'Tue', amount: 4500 },
  { day: 'Wed', amount: 8750 },
  { day: 'Thu', amount: 3800 },
  { day: 'Fri', amount: 5100 },
  { day: 'Sat', amount: 6200 },
  { day: 'Sun', amount: 2875 },
];

const monthlyData = [
  { month: 'Jan', amount: 62000 },
  { month: 'Feb', amount: 74500 },
  { month: 'Mar', amount: 58000 },
  { month: 'Apr', amount: 81000 },
  { month: 'May', amount: 79500 },
  { month: 'Jun', amount: 86250 },
];

function ProgressBar({ pct, label, subtext }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[14px] text-[#1F2937]">{label}</span>
        <span className="text-[14px] font-bold text-[#2563EB]">{pct}%</span>
      </div>
      <div className="w-full bg-[#E5E7EB] rounded-full h-2 mb-1">
        <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[12px] text-[#6B7280]">{subtext}</p>
    </div>
  );
}

export default function EarningsPage() {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="ml-[280px] flex-1 p-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1F2937]">Earnings</h1>
          <p className="text-[14px] text-[#6B7280]">Track your income and performance</p>
        </div>

        {/* Weekly Line Chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-4">Weekly Earnings</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₦${v.toLocaleString()}`, 'Earnings']} />
              <Area type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={2} fill="#2563EB" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[12px] text-[#6B7280] mt-2 text-center">Daily Earnings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Average Daily Earnings</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">₦4,125</p>
            <p className="text-[12px] text-[#6B7280] mb-1">Over 7 days</p>
            <p className="text-[12px] text-[#10B981]">+12% from last week</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Best Day</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">₦8,750</p>
            <p className="text-[12px] text-[#6B7280] mb-1">Wednesday</p>
            <p className="text-[12px] text-[#6B7280]">Normal day: ₦4,000</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
            <p className="text-[12px] text-[#6B7280] mb-2">Total This Month</p>
            <p className="text-[24px] font-bold text-[#1F2937] mb-1">₦86,250</p>
            <p className="text-[12px] text-[#6B7280]">21 days worked</p>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-4">Monthly Breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₦${v.toLocaleString()}`, 'Earnings']} />
              <Bar dataKey="amount" fill="#2563EB" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-6">Performance Metrics</p>
          <div className="grid grid-cols-3 gap-8">
            <ProgressBar pct={98} label="Order Completion Rate" subtext="Excellent performance" />
            <div>
              <p className="text-[14px] text-[#1F2937] mb-1">Customer Rating</p>
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-lg ${s <= 4 ? 'text-[#2563EB]' : 'text-[#D1D5DB]'}`}>★</span>
                ))}
                <span className="text-[14px] font-bold text-[#1F2937] ml-1">4.8 / 5</span>
              </div>
              <p className="text-[12px] text-[#6B7280]">Based on 247 ratings</p>
            </div>
            <ProgressBar pct={96} label="On-Time Deliveries" subtext="Industry average: 92%" />
          </div>
        </div>
      </main>
    </div>
  );
}
