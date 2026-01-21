import { logger } from "../../config/logger.js";
import { bullRedis } from "../../config/redis.bullmq.js";
import { Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { prisma } from "../../config/db.js";

// Example: expects job.data to be an AuditLog object
const auditWorker = new Worker(
  "audit",
  async (job) => {
    try {
      logger.info({ audit: job.data }, "Audit event processed");
      console.log("AUDIT EVENT:", job.data);

      // Store audit event in Postgres using Prisma
      await prisma.auditLog.create({
        data: {
          type: job.data.type ?? "UNKNOWN",
          severity: job.data.severity ?? "INFO",
          actorId: job.data.actorId ?? null,
          actorRole: job.data.actorRole ?? null,
          userId: job.data.userId ?? null,
          email: job.data.email ?? null,
          tokenHash: job.data.tokenHash ?? null,
          sessionId: job.data.sessionId ?? null,
          reason: job.data.reason ?? null,
          ip: job.data.ip ?? null,
          userAgent: job.data.userAgent ?? null,
          deviceFingerprint: job.data.deviceFingerprint ?? null,
          requestId: job.data.requestId ?? null,
          timestamp: typeof job.data.timestamp === "bigint" ? job.data.timestamp : (typeof job.data.timestamp === "number" ? BigInt(job.data.timestamp) : BigInt(Date.now())),
          createdAt: new Date()
        },
      });

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
