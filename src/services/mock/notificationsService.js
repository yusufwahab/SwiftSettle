import { simulate } from "../core/simulate";
import { notifications } from "../../data/mockData";

export const notificationsService = {
  async list() {
    return simulate([...notifications], { delay: 450 });
  },
};
