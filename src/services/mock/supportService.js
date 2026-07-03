import { simulate } from "../core/simulate";
import { popularQuestions, faqCategories } from "../../data/mockData";

export const supportService = {
  async getPopularQuestions() {
    return simulate([...popularQuestions], { delay: 450 });
  },

  async getFaqCategories() {
    return simulate([...faqCategories], { delay: 450 });
  },

  async search(query) {
    const term = query.trim().toLowerCase();
    if (!term) return simulate([], { delay: 300 });
    const all = faqCategories.flatMap((c) => c.items.map((i) => ({ ...i, category: c.title })));
    return simulate(
      all.filter((i) => i.q.toLowerCase().includes(term) || i.a.toLowerCase().includes(term)),
      { delay: 500 }
    );
  },
};
