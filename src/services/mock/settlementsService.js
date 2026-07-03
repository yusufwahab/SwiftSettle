import { simulate } from "../core/simulate";
import { settlements, settlementsSummary } from "../../data/mockData";

export const settlementsService = {
  async list({ status = "All", search = "" } = {}) {
    let rows = [...settlements];
    if (status !== "All") {
      rows = rows.filter((row) => row.status === status);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      rows = rows.filter(
        (row) => row.id.toLowerCase().includes(term) || String(row.amount).includes(term)
      );
    }
    return simulate(rows, { delay: 650 });
  },

  async getSummary() {
    return simulate({ ...settlementsSummary }, { delay: 500 });
  },
};
