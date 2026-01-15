import { bullRedis } from "#config/redis.bullmq.js";
import { Queue } from "bullmq";
import { logger } from "#config/logger.js";

export const auditQueue = new Queue("audit", {
  connection: bullRedis,
});

auditQueue.on("error", (err) => {
  logger.error({ err }, "Audit queue error");
});
