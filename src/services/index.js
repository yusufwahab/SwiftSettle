// Single import surface for the rest of the app: `import { authService } from
// "../services"`. Set VITE_API_MODE=live (see .env.example) to switch from
// the mock layer to the real backend — pages never import from
// services/mock or services/live directly.

import { API_MODE } from "../config/env";

import { authService as mockAuthService } from "./mock/authService";
import { walletService as mockWalletService } from "./mock/walletService";
import { earningsService as mockEarningsService } from "./mock/earningsService";
import { settlementsService as mockSettlementsService } from "./mock/settlementsService";
import { supportService as mockSupportService } from "./mock/supportService";
import { preferencesService as mockPreferencesService } from "./mock/preferencesService";
import { notificationsService as mockNotificationsService } from "./mock/notificationsService";
import { onboardingService as mockOnboardingService } from "./mock/onboardingService";
import { banksService as mockBanksService } from "./mock/banksService";
import { financialService as mockFinancialService } from "./mock/financialService";
import { creditService as mockCreditService } from "./mock/creditService";
import { payoutsService as mockPayoutsService } from "./mock/payoutsService";

import { authService as liveAuthService } from "./live/authService";
import { walletService as liveWalletService } from "./live/walletService";
import { earningsService as liveEarningsService } from "./live/earningsService";
import { settlementsService as liveSettlementsService } from "./live/settlementsService";
import { onboardingService as liveOnboardingService } from "./live/onboardingService";
import { banksService as liveBanksService } from "./live/banksService";
import { financialService as liveFinancialService } from "./live/financialService";
import { creditService as liveCreditService } from "./live/creditService";
import { notificationsService as liveNotificationsService } from "./live/notificationsService";
import { payoutsService as livePayoutsService } from "./live/payoutsService";

const registry = {
  mock: {
    authService: mockAuthService,
    walletService: mockWalletService,
    earningsService: mockEarningsService,
    settlementsService: mockSettlementsService,
    supportService: mockSupportService,
    preferencesService: mockPreferencesService,
    notificationsService: mockNotificationsService,
    onboardingService: mockOnboardingService,
    banksService: mockBanksService,
    financialService: mockFinancialService,
    creditService: mockCreditService,
    payoutsService: mockPayoutsService,
  },
  live: {
    authService: liveAuthService,
    walletService: liveWalletService,
    earningsService: liveEarningsService,
    settlementsService: liveSettlementsService,
    onboardingService: liveOnboardingService,
    banksService: liveBanksService,
    financialService: liveFinancialService,
    creditService: liveCreditService,
    notificationsService: liveNotificationsService,
    payoutsService: livePayoutsService,
    // No backend exists for support/FAQ or notification preferences in
    // either prompt — live mode still reads this canned content rather
    // than the app breaking outright.
    supportService: mockSupportService,
    preferencesService: mockPreferencesService,
  },
};

const active = registry[API_MODE] || registry.mock;

export const authService = active.authService;
export const walletService = active.walletService;
export const earningsService = active.earningsService;
export const settlementsService = active.settlementsService;
export const supportService = active.supportService;
export const preferencesService = active.preferencesService;
export const notificationsService = active.notificationsService;
export const onboardingService = active.onboardingService;
export const banksService = active.banksService;
export const financialService = active.financialService;
export const creditService = active.creditService;
export const payoutsService = active.payoutsService;
