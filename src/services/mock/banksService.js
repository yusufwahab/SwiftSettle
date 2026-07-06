import { simulate } from "../core/simulate";

// Real, standard CBN bank codes for the same banks already listed in
// mockData.nigerianBanks — mock mode needs actual codes too, not just
// names, so the onboarding wizard behaves identically in both modes.
const banks = [
  { code: "044", name: "Access Bank" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "057", name: "Zenith Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "032", name: "Union Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "039", name: "Stanbic IBTC Bank" },
];

export const banksService = {
  async list() {
    return simulate([...banks], { delay: 300 });
  },
};
