import { simulate } from "../core/simulate";
import { notificationDefaults } from "../../data/mockPreferences";

export const preferencesService = {
  async getNotifications() {
    return simulate({ ...notificationDefaults }, { delay: 550 });
  },

  async updateNotifications(next) {
    return simulate({ ...next }, { delay: 400 });
  },
};
