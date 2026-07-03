import { useState } from 'react';

export default function SettlementModal({ onClose }) {
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSettle = () => {
    setStatus('loading');
    setTimeout(() => setStatus('success'), 2500);
  };

  if (status === 'success') {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <div className="text-5xl text-[#10B981] mb-4">✓</div>
          <h2 className="text-[20px] font-bold text-[#1F2937] mb-2">Settlement Successful!</h2>
          <p className="text-[14px] text-[#6B7280] mb-1">₦12,450 has been sent to your GTB account</p>
          <p className="text-[12px] text-[#6B7280] mb-1">Reference: SW-2026-001234</p>
          <p className="text-[12px] text-[#6B7280] mb-6">You'll see it in your bank within minutes</p>
          <button onClick={onClose} className="w-full bg-[#2563EB] text-white py-3 rounded text-[14px] font-medium hover:bg-[#1D4ED8] cursor-pointer">
            Back to Dashboard
          </button>
        </div>
      </ModalWrapper>
    );
  }

  if (status === 'error') {
    return (
      <ModalWrapper onClose={onClose}>
        <div className="text-center py-4">
          <div className="text-5xl text-[#DC2626] mb-4">✕</div>
          <h2 className="text-[20px] font-bold text-[#1F2937] mb-2">Settlement Failed</h2>
          <p className="text-[14px] text-[#6B7280] mb-1">Something went wrong. Please try again.</p>
          <p className="text-[12px] text-[#9CA3AF] mb-6">Bank transfer API timeout</p>
          <div className="flex gap-3">
            <button onClick={() => setStatus('idle')} className="flex-1 bg-[#2563EB] text-white py-3 rounded text-[14px] cursor-pointer hover:bg-[#1D4ED8]">Retry</button>
            <button onClick={onClose} className="flex-1 border border-[#E5E7EB] text-[#6B7280] py-3 rounded text-[14px] cursor-pointer hover:bg-[#F9FAFB]">Contact Support</button>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper onClose={onClose}>
      {status === 'loading' && (
        <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-white border-t-[#2563EB] rounded-full animate-spin mb-3" />
          <p className="text-white text-[14px]">Processing your settlement...</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-[#1F2937]">Settle Your Earnings</h2>
        <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] text-xl cursor-pointer">✕</button>
      </div>

      <div className="bg-[#F9FAFB] p-4 rounded mb-5">
        <div className="flex justify-between mb-2">
          <span className="text-[14px] text-[#6B7280]">Available Balance</span>
          <span className="text-[24px] font-bold text-[#2563EB]">₦12,450</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-[14px] text-[#6B7280]">Settlement Fee</span>
          <span className="text-[14px] text-[#6B7280]">Free</span>
        </div>
        <div className="flex justify-between border-t border-[#E5E7EB] pt-2 mt-2">
          <span className="text-[14px] text-[#6B7280]">You'll Receive</span>
          <span className="text-[24px] font-bold text-[#1F2937]">₦12,450</span>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[14px] font-semibold text-[#1F2937] mb-3">Settlement Method</p>
        <label className="flex items-start gap-3 p-3 border border-[#2563EB] rounded cursor-pointer mb-2">
          <input type="radio" name="bank" defaultChecked className="mt-1" />
          <div>
            <p className="text-[14px] font-medium text-[#1F2937]">Guaranty Trust Bank (GTB)</p>
            <p className="text-[12px] text-[#6B7280]">**** **** **** 5678 · Chioma Adeyemi</p>
          </div>
        </label>
        <button className="text-[14px] text-[#2563EB] cursor-pointer hover:underline">+ Add New Account</button>
      </div>

      <label className="flex items-start gap-2 mb-6 cursor-pointer">
        <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />
        <span className="text-[12px] text-[#6B7280]">I confirm that the above details are correct and authorize this settlement</span>
      </label>

      <div className="flex gap-3">
        <button onClick={onClose} className="w-[48%] bg-[#E5E7EB] text-[#1F2937] py-3 rounded text-[14px] cursor-pointer hover:bg-[#D1D5DB]">Cancel</button>
        <button
          onClick={handleSettle}
          disabled={!confirmed}
          className={`w-[48%] py-3 rounded text-[14px] text-white font-medium transition-colors ${confirmed ? 'bg-[#10B981] hover:bg-[#059669] cursor-pointer' : 'bg-[#D1D5DB] cursor-not-allowed'}`}
        >
          {status === 'loading' ? 'Processing...' : 'Settle Now'}
        </button>
      </div>
    </ModalWrapper>
  );
}

function ModalWrapper({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 w-[480px] max-w-[95vw] shadow-[0_20px_25px_rgba(0,0,0,0.15)] relative" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
