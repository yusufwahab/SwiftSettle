import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UnsplashImage from '../components/UnsplashImage';

const BANKS = ['Guaranty Trust Bank (GTB)', 'First Bank', 'Access Bank', 'United Bank for Africa (UBA)', 'Zenith Bank', 'Fidelity Bank', 'Sterling Bank', 'Polaris Bank', 'Wema Bank', 'Union Bank'];

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', accountNumber: '', bank: '', accountType: 'Savings', password: '', confirmPassword: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const sendOtp = () => {
    setOtpSent(true);
    setCountdown(30);
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const inputCls = 'w-full border border-[#D1D5DB] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#2563EB]';

  return (
    <div className="flex min-h-screen">
      {/* Left: Form */}
      <div className="w-1/2 bg-white p-[60px] overflow-y-auto">
        <Link to="/" className="text-[24px] font-bold text-[#2563EB] block mb-8">SwiftSettle</Link>
        <h1 className="text-[32px] font-bold text-[#1F2937] mb-2">Get Started</h1>
        <p className="text-[16px] text-[#6B7280] mb-8">Create your SwiftSettle account in 2 minutes</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Step 1 */}
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide">Step 1 — Personal Information</p>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Full Name</label>
            <input value={form.name} onChange={set('name')} placeholder="Chioma Adeyemi" className={inputCls} required />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Email Address</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="chioma@example.com" className={inputCls} required />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Phone Number</label>
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+234 (0) 800 000 0000" className={inputCls} required />
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Date of Birth</label>
            <input type="text" value={form.dob} onChange={set('dob')} placeholder="DD/MM/YYYY" className={inputCls} required />
          </div>

          {/* Step 2 */}
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mt-2">Step 2 — Bank Details</p>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Bank Account Number</label>
            <input value={form.accountNumber} onChange={set('accountNumber')} placeholder="1234567890" className={inputCls} required />
            <p className="text-[12px] text-[#6B7280] mt-1">Where we'll settle your earnings</p>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Select Your Bank</label>
            <select value={form.bank} onChange={set('bank')} className={inputCls} required>
              <option value="">Choose your bank</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Account Type</label>
            <div className="flex gap-6">
              {['Savings', 'Checking'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-[14px] text-[#1F2937]">
                  <input type="radio" name="accountType" value={t} checked={form.accountType === t} onChange={set('accountType')} />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mt-2">Step 3 — Security</p>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Create Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" className={inputCls} required />
            <p className="text-[12px] text-[#6B7280] mt-1">Minimum 8 characters, 1 uppercase, 1 number</p>
          </div>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" className={inputCls} required />
          </div>

          {/* Step 4 */}
          <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide mt-2">Step 4 — Verification</p>
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-2">Verify Your Phone</label>
            <button type="button" onClick={sendOtp} disabled={countdown > 0} className="border border-[#2563EB] text-[#2563EB] px-4 py-2 text-[14px] rounded hover:bg-[#EFF6FF] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-3">
              {countdown > 0 ? `Resend in ${countdown}s` : 'Send OTP'}
            </button>
            {otpSent && (
              <input value={form.otp} onChange={set('otp')} placeholder="000000" maxLength={6} className={inputCls} />
            )}
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1" required />
            <span className="text-[14px] text-[#6B7280]">I agree to the <a href="#" className="text-[#2563EB] hover:underline">Terms of Service</a> and <a href="#" className="text-[#2563EB] hover:underline">Privacy Policy</a></span>
          </label>

          <button type="submit" disabled={submitting} className="w-full bg-[#2563EB] text-white py-3 text-[14px] font-medium rounded hover:bg-[#1D4ED8] cursor-pointer disabled:opacity-70 transition-colors">
            {submitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[14px] text-[#6B7280] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2563EB] hover:underline">Sign in</Link>
        </p>
      </div>

      {/* Right: Image */}
      <div className="w-1/2 sticky top-0 h-screen">
        <UnsplashImage query="signupRight" className="w-full h-full object-cover object-center" alt="Gig worker success" />
        <div className="absolute bottom-[30px] right-[30px] bg-black/30 p-4 max-w-[220px]">
          <p className="text-white text-[14px] mb-1">"I now get paid same day. Life has changed."</p>
          <p className="text-white text-[12px]">- Chioma, Delivery Driver</p>
        </div>
      </div>
    </div>
  );
}
