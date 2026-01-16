import { logger } from "#config/logger.js";
import { bullRedis } from "#config/redis.bullmq.js";
import { Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";

const auditWorker = new Worker(
  "audit",
  async (job) => {
    try {
      logger.info({ audit: job.data }, "Audit event processed");
      console.log("AUDIT EVENT:", job.data);
      // TODO: store in DB or SIEM
    } catch (err) {
      logger.error({ err, job: job.id }, "Error processing audit event");
      throw err;
    }
  },
  { connection: bullRedis as unknown as ConnectionOptions }
);

auditWorker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Audit worker job failed");
});
