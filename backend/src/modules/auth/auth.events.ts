import { emitAudit } from "#shared/events/audit.events.js";
import type {
  LoginFailedEvent,
  LoginSuccessEvent,
} from "#shared/types/audit-event.types.js";

export function loginFailed(data: Omit<LoginFailedEvent, "type">) {
  return emitAudit({ ...data, type: "LOGIN_FAILED" });
}

export function loginSuccess(data: Omit<LoginSuccessEvent, "type">) {
  return emitAudit({ ...data, type: "LOGIN_SUCCESS" });
}
