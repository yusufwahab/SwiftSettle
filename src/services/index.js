// Single import surface for the rest of the app: `import { authService } from
// "../services"`. Today API_MODE is always "mock". Pointing it at "live"
// later means adding services/live/*.js with the same method names and
// wiring them in below — pages never import from services/mock directly.

import { API_MODE } from "../config/env";

import { authService as mockAuthService } from "./mock/authService";
import { walletService as mockWalletService } from "./mock/walletService";
import { earningsService as mockEarningsService } from "./mock/earningsService";
import { settlementsService as mockSettlementsService } from "./mock/settlementsService";
import { supportService as mockSupportService } from "./mock/supportService";
import { preferencesService as mockPreferencesService } from "./mock/preferencesService";
import { notificationsService as mockNotificationsService } from "./mock/notificationsService";

const registry = {
  mock: {
    authService: mockAuthService,
    walletService: mockWalletService,
    earningsService: mockEarningsService,
    settlementsService: mockSettlementsService,
    supportService: mockSupportService,
    preferencesService: mockPreferencesService,
    notificationsService: mockNotificationsService,
  },
  // live: { authService: liveAuthService, ... } — added when Nomba is wired up.
};

const active = registry[API_MODE] || registry.mock;

export const authService = active.authService;
export const walletService = active.walletService;
export const earningsService = active.earningsService;
export const settlementsService = active.settlementsService;
export const supportService = active.supportService;
export const preferencesService = active.preferencesService;
export const notificationsService = active.notificationsService;
