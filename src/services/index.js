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

import { authService as liveAuthService } from "./live/authService";
import { walletService as liveWalletService } from "./live/walletService";
import { earningsService as liveEarningsService } from "./live/earningsService";
import { settlementsService as liveSettlementsService } from "./live/settlementsService";
import { onboardingService as liveOnboardingService } from "./live/onboardingService";
import { banksService as liveBanksService } from "./live/banksService";

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
  },
  live: {
    authService: liveAuthService,
    walletService: liveWalletService,
    earningsService: liveEarningsService,
    settlementsService: liveSettlementsService,
    onboardingService: liveOnboardingService,
    banksService: liveBanksService,
    // No backend exists for support/FAQ, notification-panel copy, or
    // notification preferences in either prompt — live mode still reads
    // this canned content rather than the app breaking outright.
    supportService: mockSupportService,
    preferencesService: mockPreferencesService,
    notificationsService: mockNotificationsService,
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
