import type { AuditBase } from "#shared/types/audit-event.types.js";
import { auditQueue } from "./eventBus.js";
import { logger } from "#config/logger.js";

export async function emitAudit(event: AuditBase) {
  try {
    return await auditQueue.add("audit", event);
  } catch (err) {
    logger.error({ err, event }, "Failed to emit audit event");

    throw err;
  }
}
