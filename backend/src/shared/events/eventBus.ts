import { bullRedis } from "../../config/redis.bullmq.js";
import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { logger } from "../../config/logger.js";

export const auditQueue = new Queue("audit", {
  connection: bullRedis as unknown as ConnectionOptions,
});

auditQueue.on("error", (err) => {
  logger.error({ err }, "Audit queue error");
});
