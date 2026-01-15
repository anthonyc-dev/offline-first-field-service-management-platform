import { bullRedis } from "#config/redis.bullmq.js";
import { Queue } from "bullmq";

export const auditQueue = new Queue("audit", {
  connection: bullRedis,
});
