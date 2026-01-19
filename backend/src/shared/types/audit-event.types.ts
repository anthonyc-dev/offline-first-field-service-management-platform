export type AuditSeverity = "INFO" | "WARN" | "CRITICAL";


// For Login success and failed
export interface AuditBase {
  type: string;
  severity?: AuditSeverity;
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
  severty?:"WARN";
  email: string;
  reason?: string;
}

export interface LoginSuccessEvent extends AuditBase {
  type: "LOGIN_SUCCESS";
  severty?:"INFO";
  userId: string;
  email: string;
}


// Detect RefreshToken Reuse
export interface RefreshTokenReuseDetectedEvent extends AuditBase {
  type: "REFRESH_TOKEN_REUSE_DETECTED";
  severity: "CRITICAL";
  userId: string;
  email:string
  sessionId?: string;
  tokenHash: string;   
  reason?: string;   
  actionTaken: "REVOKE_ALL_SESSIONS" | "REVOKE_SESSION_ONLY";
}



