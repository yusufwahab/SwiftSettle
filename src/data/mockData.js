// Static seed data for the mock service layer.
// Every service reads from here so the shape mirrors what real Nomba
// endpoints would eventually return.

export const nigerianBanks = [
  "Access Bank",
  "Guaranty Trust Bank (GTB)",
  "First Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Zenith Bank",
  "Fidelity Bank",
  "Union Bank",
  "Sterling Bank",
  "Wema Bank",
  "Polaris Bank",
  "Ecobank Nigeria",
  "Stanbic IBTC Bank",
];

export const currentWorker = {
  id: "wkr_001",
  fullName: "Chioma Adeyemi",
  shortName: "Chioma A.",
  email: "chioma@example.com",
  emailVerified: true,
  phone: "+234 801 234 5678",
  dateOfBirth: "15 Mar 1995",
  state: "Lagos",
  platform: "Uber",
  bank: {
    name: "Guaranty Trust Bank (GTB)",
    accountNumber: "0123465678",
    accountNumberMasked: "**** **** 5678",
    accountHolder: "Chioma Adeyemi",
    isPrimary: true,
  },
  bankVerified: true,
  financialScore: 712,
  creditTier: "standard",
  identityVerificationStatus: "verified",
  twoFactorEnabled: false,
  onboardingStep: 4,
  onboardingCompletedAt: "2026-06-01T09:00:00.000Z",
};

export const balanceSummary = {
  available: 12450,
  updatedAt: "2 minutes ago",
  todayEarnings: 4500,
  todayTrend: 1200,
  pendingPayouts: 0,
  weekTotal: 28750,
  weekDays: 7,
};

export const notifications = [
  { id: "n1", type: "success", text: "Settlement of ₦5,000 completed", time: "2 hours ago" },
  { id: "n2", type: "info", text: "Weekly earnings summary is ready", time: "Yesterday" },
  { id: "n3", type: "primary", text: "New device signed in to your account", time: "2 days ago" },
  { id: "n4", type: "warning", text: "Settlement SW-2026-001214 is pending", time: "3 days ago" },
];

export const todayActivity = [
  { id: "act_1", label: "Delivery completed", time: "2:15 PM", amount: 1250 },
  { id: "act_2", label: "Delivery completed", time: "1:42 PM", amount: 950 },
  { id: "act_3", label: "Delivery completed", time: "12:58 PM", amount: 1400 },
  { id: "act_4", label: "Delivery completed", time: "11:20 AM", amount: 900 },
];

export const settlements = [
  { id: "SW-2026-001234", date: "3 Jul 2026", time: "2:34 PM", amount: 5000, status: "Completed" },
  { id: "SW-2026-001229", date: "1 Jul 2026", time: "6:10 PM", amount: 8750, status: "Completed" },
  { id: "SW-2026-001221", date: "29 Jun 2026", time: "4:02 PM", amount: 3200, status: "Completed" },
  { id: "SW-2026-001214", date: "27 Jun 2026", time: "9:45 AM", amount: 6100, status: "Pending" },
  { id: "SW-2026-001206", date: "24 Jun 2026", time: "3:18 PM", amount: 4500, status: "Completed" },
  { id: "SW-2026-001198", date: "21 Jun 2026", time: "11:52 AM", amount: 2900, status: "Failed" },
  { id: "SW-2026-001190", date: "19 Jun 2026", time: "5:27 PM", amount: 7300, status: "Completed" },
];

export const settlementsSummary = {
  totalSettled: 86250,
  rangeLabel: "30 days",
  pendingAmount: 0,
  settledCount: 23,
};

export const weeklyEarnings = [
  { day: "Mon", amount: 3800 },
  { day: "Tue", amount: 4200 },
  { day: "Wed", amount: 8750 },
  { day: "Thu", amount: 3950 },
  { day: "Fri", amount: 4500 },
  { day: "Sat", amount: 2100 },
  { day: "Sun", amount: 1550 },
];

export const monthlyEarnings = [
  { month: "Jan", amount: 62000 },
  { month: "Feb", amount: 71500 },
  { month: "Mar", amount: 68200 },
  { month: "Apr", amount: 79800 },
  { month: "May", amount: 84300 },
  { month: "Jun", amount: 86250 },
];

export const earningsStats = {
  averageDaily: { amount: 4125, subtext: "Over 7 days", changeLabel: "+12% from last week" },
  bestDay: { amount: 8750, subtext: "Wednesday", comparator: "Normal day: ₦4,000" },
  totalThisMonth: { amount: 86250, subtext: "21 days worked" },
};

export const performanceMetrics = {
  completionRate: 98,
  rating: 4.8,
  ratingCount: 247,
  onTimeRate: 96,
  industryAverage: 92,
};

export const popularQuestions = [
  {
    id: "q1",
    title: "How do I settle my earnings?",
    category: "Settlements",
    excerpt: "Learn how to withdraw your earnings in minutes with a single confirmation.",
  },
  {
    id: "q2",
    title: "How do I update my bank account?",
    category: "Account",
    excerpt: "Change your bank details or add a new settlement account.",
  },
  {
    id: "q3",
    title: "Why is my settlement pending?",
    category: "Troubleshooting",
    excerpt: "Understand why your settlement might take a little longer to clear.",
  },
];

export const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      {
        q: "How do I create an account?",
        a: "Select “Start as a Worker” on the landing page, fill in your personal details, add your bank account, and verify your phone number with the OTP we send you.",
      },
      {
        q: "How do I link my bank account?",
        a: "During signup, or later from Settings, add your account number and select your bank from the list. We verify the account name automatically.",
      },
      {
        q: "What information do I need to sign up?",
        a: "Your full name, phone number, email, date of birth, and a bank account you want your earnings settled to.",
      },
    ],
  },
  {
    id: "earnings",
    title: "Earnings & Settlements",
    items: [
      {
        q: "How do earnings appear on my dashboard?",
        a: "Every completed order updates your available balance in real time — no waiting for end-of-day reconciliation.",
      },
      {
        q: "When are earnings settled?",
        a: "Whenever you choose. Tap “Settle Now” and the transfer to your bank account is initiated immediately.",
      },
      {
        q: "Can I settle whenever I want?",
        a: "Yes. There is no minimum wait time and no limit on how often you settle your balance.",
      },
    ],
  },
];
