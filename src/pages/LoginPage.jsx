import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UnsplashImage from '../components/UnsplashImage';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!showOtp) { setShowOtp(true); return; }
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen">
      {/* Left: Form */}
      <div className="w-1/2 bg-white p-[60px] flex flex-col justify-center overflow-y-auto">
        <Link to="/" className="text-[24px] font-bold text-[#2563EB] mb-10 block">SwiftSettle</Link>
        <h1 className="text-[32px] font-bold text-[#1F2937] mt-10 mb-2">Welcome Back</h1>
        <p className="text-[16px] text-[#6B7280] mb-10">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 (0) 800 000 0000"
              className="w-full border border-[#D1D5DB] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#2563EB]"
              required
            />
            <p className="text-[12px] text-[#6B7280] mt-1">We'll send you an OTP to verify</p>
          </div>

          {showOtp && (
            <div>
              <label className="block text-[14px] font-medium text-[#1F2937] mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full border border-[#D1D5DB] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#2563EB]"
                required
              />
              <p className="text-[12px] text-[#6B7280] mt-1">Check your phone or email</p>
            </div>
          )}

          <button type="submit" className="w-full bg-[#2563EB] text-white py-3 text-[14px] font-medium rounded hover:bg-[#1D4ED8] cursor-pointer transition-colors">
            {showOtp ? 'Sign In' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-[14px] text-[#6B7280] mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2563EB] hover:underline">Sign up</Link>
        </p>
      </div>

      {/* Right: Image */}
      <div className="w-1/2 relative">
        <UnsplashImage query="loginRight" className="w-full h-full object-cover object-center" alt="Happy delivery worker" />
        <div className="absolute bottom-[30px] right-[30px] bg-black/30 p-4 max-w-[220px]">
          <p className="text-white text-[14px] mb-1">"I now get paid same day. Life has changed."</p>
          <p className="text-white text-[12px]">- Chioma, Delivery Driver</p>
        </div>
      </div>
    </div>
  );
}
