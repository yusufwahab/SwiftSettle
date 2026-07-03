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
};
