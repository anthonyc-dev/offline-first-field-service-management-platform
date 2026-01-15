import type { AuditBase } from "#shared/types/audit-event.types.js";
import { auditQueue } from "./eventBus.js";

export function emitAudit(event: AuditBase) {
  return auditQueue.add("audit", event);
}
