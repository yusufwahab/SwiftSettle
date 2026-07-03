import { useState } from 'react';
import Sidebar from '../components/Sidebar';

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${on ? 'bg-[#2563EB]' : 'bg-[#D1D5DB]'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function NotifRow({ label, on, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0">
      <span className="text-[14px] text-[#1F2937]">{label}</span>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const [editing, setEditing] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [notifs, setNotifs] = useState({
    settlements: true, weekly: true, security: true, marketing: false,
    orders: true, settlementAlerts: true, activity: true, sms: true,
  });
  const setN = (k) => (v) => setNotifs(n => ({ ...n, [k]: v }));

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="ml-[280px] flex-1 p-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#1F2937]">Settings</h1>
          <p className="text-[14px] text-[#6B7280]">Manage your account and preferences</p>
        </div>

        {/* Account Settings */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-bold text-[#1F2937]">Personal Information</p>
            <button onClick={() => setEditing(!editing)} className="text-[14px] text-[#2563EB] cursor-pointer hover:underline">{editing ? 'Cancel' : 'Edit'}</button>
          </div>
          {[
            { label: 'Full Name', value: 'Chioma Adeyemi' },
            { label: 'Email', value: 'chioma@example.com' },
            { label: 'Phone', value: '+234 801 234 5678' },
            { label: 'Date of Birth', value: '15 Mar 1995' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0">
              <span className="text-[12px] text-[#6B7280] w-32">{label}</span>
              {editing
                ? <input defaultValue={value} className="flex-1 border border-[#D1D5DB] px-3 py-1.5 text-[14px] rounded focus:outline-none focus:border-[#2563EB]" />
                : <span className="text-[14px] text-[#1F2937]">{value}</span>
              }
            </div>
          ))}
          {editing && <button className="mt-4 bg-[#2563EB] text-white px-6 py-2 text-[14px] rounded hover:bg-[#1D4ED8] cursor-pointer">Save Changes</button>}

          <p className="text-[14px] font-bold text-[#1F2937] mt-6 mb-4">Bank Details</p>
          {[
            { label: 'Bank Name', value: 'Guaranty Trust Bank (GTB)' },
            { label: 'Account Number', value: '**** **** **** 5678' },
            { label: 'Account Holder', value: 'Chioma Adeyemi' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0">
              <span className="text-[12px] text-[#6B7280] w-32">{label}</span>
              <span className="text-[14px] text-[#1F2937]">{value}</span>
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-4">Change Password</p>
          <div className="flex flex-col gap-3 mb-6">
            {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
              <div key={l}>
                <label className="block text-[12px] text-[#6B7280] mb-1">{l}</label>
                <input type="password" className="w-full border border-[#D1D5DB] px-4 py-2.5 text-[14px] rounded focus:outline-none focus:border-[#2563EB]" />
              </div>
            ))}
            <button className="w-full bg-[#2563EB] text-white py-3 text-[14px] rounded hover:bg-[#1D4ED8] cursor-pointer">Update Password</button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <div>
              <p className="text-[14px] font-bold text-[#1F2937]">Two-Factor Authentication</p>
              <p className="text-[12px] text-[#6B7280]">{twoFA ? '2FA is enabled. You\'ll receive codes via SMS' : 'Add an extra layer of security to your account'}</p>
            </div>
            <Toggle on={twoFA} onChange={setTwoFA} />
          </div>
          {twoFA && <button className="mt-3 bg-[#DC2626] text-white px-4 py-2 text-[14px] rounded hover:bg-[#B91C1C] cursor-pointer">Disable 2FA</button>}
        </div>

        {/* Notifications */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-4">Notifications</p>
          <p className="text-[12px] font-semibold text-[#6B7280] mb-2 uppercase tracking-wide">Email</p>
          <NotifRow label="Settlement Confirmations" on={notifs.settlements} onChange={setN('settlements')} />
          <NotifRow label="Weekly Earnings Summary" on={notifs.weekly} onChange={setN('weekly')} />
          <NotifRow label="Security Alerts" on={notifs.security} onChange={setN('security')} />
          <NotifRow label="Marketing & Promotions" on={notifs.marketing} onChange={setN('marketing')} />
          <p className="text-[12px] font-semibold text-[#6B7280] mt-4 mb-2 uppercase tracking-wide">Push</p>
          <NotifRow label="Order Updates" on={notifs.orders} onChange={setN('orders')} />
          <NotifRow label="Settlement Alerts" on={notifs.settlementAlerts} onChange={setN('settlementAlerts')} />
          <NotifRow label="Account Activity" on={notifs.activity} onChange={setN('activity')} />
          <p className="text-[12px] font-semibold text-[#6B7280] mt-4 mb-2 uppercase tracking-wide">SMS</p>
          <NotifRow label="Critical Alerts Only" on={notifs.sms} onChange={setN('sms')} />
          <p className="text-[12px] text-[#6B7280] mt-1">We'll only SMS you for urgent account issues</p>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-6">
          <p className="text-[14px] font-bold text-[#1F2937] mb-2">Delete Account</p>
          <p className="text-[14px] text-[#6B7280] mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button onClick={() => setShowDeleteModal(true)} className="bg-[#DC2626] text-white px-6 py-2 text-[14px] rounded hover:bg-[#B91C1C] cursor-pointer">Delete Account</button>
        </div>
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg p-8 w-[440px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
            <h2 className="text-[20px] font-bold text-[#1F2937] mb-3">Are you sure?</h2>
            <p className="text-[14px] text-[#6B7280] mb-5">Deleting your account will remove all your data. This cannot be undone.</p>
            <label className="flex items-start gap-2 mb-6 cursor-pointer">
              <input type="checkbox" checked={deleteConfirmed} onChange={e => setDeleteConfirmed(e.target.checked)} className="mt-1" />
              <span className="text-[14px] text-[#6B7280]">I understand and want to delete my account</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-[#E5E7EB] text-[#1F2937] py-3 rounded text-[14px] cursor-pointer hover:bg-[#D1D5DB]">Cancel</button>
              <button disabled={!deleteConfirmed} className={`flex-1 py-3 rounded text-[14px] text-white transition-colors ${deleteConfirmed ? 'bg-[#DC2626] hover:bg-[#B91C1C] cursor-pointer' : 'bg-[#D1D5DB] cursor-not-allowed'}`}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
