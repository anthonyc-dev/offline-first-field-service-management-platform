// types/audit-event.ts
export interface AuditBase {
  type: string;
  actorId: string | null;
  actorRole: "user" | "admin" | "system";

  timestamp: number;
  requestId: string;

  ip?: string;
  userAgent?: string;
  deviceFingerprint?: string;
}

export interface LoginFailedEvent extends AuditBase {
  type: "LOGIN_FAILED";
  email: string;
  reason?: "INVALID_PASSWORD" | "USER_NOT_FOUND" | "LOCKED";
}

export interface LoginSuccessEvent extends AuditBase {
  type: "LOGIN_SUCCESS";
  userId: string;
  email: string;
}
