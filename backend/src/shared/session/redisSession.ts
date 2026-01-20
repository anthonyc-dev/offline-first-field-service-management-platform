import { getRedisClient } from "../../config/redis.js";

const SESSION_TTL = 60 * 5; // 60 * 30 = 30  minutes

export async function createSession(sessionId: string, data: any) {
  try {
    const client = await getRedisClient();
    await client.set(`session:${sessionId}`, JSON.stringify(data), {
      EX: SESSION_TTL,
    });
    await client.sAdd(`user_sessions:${data.userId}`, sessionId);

    return { sessionId, ...data };
  } catch (error) {
    console.error(`Failed to create session ${sessionId}:`, error);
    throw new Error(
      `Redis session creation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export async function getSession(sessionId: string) {
  try {
    const client = await getRedisClient();
    const data = await client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to get session ${sessionId}:`, error);
  
    return null;
  }
}

export async function revokeSession(sessionId: string, userId?: string) {
  try {
    const client = await getRedisClient();
    await client.del(`session:${sessionId}`);
    if (userId) await client.sRem(`user_sessions:${userId}`, sessionId);
  } catch (error) {
    console.error(`Failed to revoke session ${sessionId}:`, error);

  }
}

export async function getUserSessions(userId: string) {
  try {
    const client = await getRedisClient();
    return await client.sMembers(`user_sessions:${userId}`);
  } catch (error) {
    console.error(`Failed to get user sessions for ${userId}:`, error);
 
    return [];
  }
}

export async function acquireUserLock(userId: string, ttlMs = 3000) {
  const client = await getRedisClient();
  const key = `lock:user:${userId}`;
  const ok = await client.set(key, "1", {
    NX: true,
    PX: ttlMs,
  });
  return ok === "OK";
}

export async function releaseUserLock(userId: string) {
  const client = await getRedisClient();
  await client.del(`lock:user:${userId}`);
}

