import { logger } from "#config/logger.js";
import { bullRedis } from "#config/redis.bullmq.js";
import { Worker } from "bullmq";

new Worker(
  "audit",
  async (job) => {
    logger.info({ audit: job.data }, "Audit event processed");
    console.log("AUDIT EVENT:", job.data);
    // TODO: store in DB or SIEM
  },
  { connection: bullRedis }
);
