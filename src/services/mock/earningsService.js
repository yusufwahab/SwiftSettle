import { simulate } from "../core/simulate";
import { weeklyEarnings, monthlyEarnings, earningsStats, performanceMetrics } from "../../data/mockData";

export const earningsService = {
  async getWeekly() {
    return simulate([...weeklyEarnings], { delay: 600 });
  },

  async getMonthly() {
    return simulate([...monthlyEarnings], { delay: 600 });
  },

  async getStats() {
    return simulate({ ...earningsStats }, { delay: 500 });
  },

  async getPerformance() {
    return simulate({ ...performanceMetrics }, { delay: 500 });
  },

  // Mock mode already ships with populated demo data, so this doesn't need
  // to mutate anything — just mirrors the live endpoint's response shape so
  // the same "Simulate Delivery" button works in both modes.
  async simulate() {
    const amount = Math.round((800 + Math.random() * 2200) / 50) * 50;
    return simulate({ simulated: true, amount }, { delay: 500 });
  },
};
