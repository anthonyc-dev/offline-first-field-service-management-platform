import { emitAudit } from "../../shared/events/audit.events.js";
import type {
  AuditLog
} from "../../shared/types/audit-event.types.js";

export function AuditLogEvent(data: AuditLog) {
  return emitAudit(data);
}

export function loginSuccess(data: Omit<AuditLog, "type">) {
  return emitAudit({ ...data, type: "LOGIN_SUCCESS" });
}


export function refreshTokenReuseDetected(
  data: Omit<AuditLog, "type">
) {
  return emitAudit({ ...data, type: "REFRESH_TOKEN_REUSE_DETECTED" });
}

