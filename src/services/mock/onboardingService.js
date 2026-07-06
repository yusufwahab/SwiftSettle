import { simulate } from "../core/simulate";

// No real backend in mock mode, so each step just maps its form fields onto
// the same camelCase worker shape normalizeWorker() produces for live mode
// — AuthContext merges whatever partial object comes back the same way
// regardless of which mode is active.
export const onboardingService = {
  async submitStep(step, data) {
    const nextStep = Math.min(4, step + 1);
    let worker = { onboardingStep: nextStep };

    if (step === 1) {
      worker = {
        ...worker,
        dateOfBirth: data.date_of_birth,
        state: data.state,
        platform: data.platform,
        phone: data.phone_number,
      };
    }
    if (step === 2) {
      worker = {
        ...worker,
        bank: {
          name: data.bank_name,
          accountNumber: data.account_number,
          accountNumberMasked: data.account_number ? `**** **** ${data.account_number.slice(-4)}` : "",
          accountHolder: data.account_holder_name,
          isPrimary: true,
        },
        bankVerified: true,
      };
    }
    if (step === 3) {
      worker = { ...worker, twoFactorEnabled: Boolean(data.two_factor_enabled) };
    }
    if (step === 4) {
      worker = { ...worker, onboardingCompletedAt: new Date().toISOString() };
    }

    return simulate({ nextStep, worker }, { delay: 500 });
  },
};
