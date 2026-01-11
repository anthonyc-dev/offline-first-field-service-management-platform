import { authService } from "../modules/auth/auth.service.js";
import { prisma } from "./setup.js";

describe("Auth Tests - Login and Register", () => {
  const deviceInfo = {
    deviceId: "test-device-123",
    userAgent: "Mozilla/5.0",
    ipAddress: "127.0.0.1",
  };

  const userData = {
    fullName: "Test User",
    email: "test@example.com",
    password: "TestPassword123!",
    phoneNumber: "1234567890",
  };

  it("should successfully register a new user", async () => {
    const result = await authService.register({
      ...userData,
      ...deviceInfo,
    });

    // Verify response structure
    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");

    // Verify user data
    expect(result.user.email).toBe(userData.email);
    expect(result.user.fullName).toBe(userData.fullName);
    expect(result.user).toHaveProperty("id");
    expect(result.user).toHaveProperty("role");

    // Verify tokens are strings and not empty
    expect(typeof result.accessToken).toBe("string");
    expect(result.accessToken.length).toBeGreaterThan(0);
    expect(typeof result.refreshToken).toBe("string");
    expect(result.refreshToken.length).toBeGreaterThan(0);

    // Verify user was created in database
    const dbUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.email).toBe(userData.email);
    expect(dbUser?.fullName).toBe(userData.fullName);

    // Verify session was created
    const sessions = await prisma.session.findMany({
      where: { userId: dbUser!.id },
    });
    expect(sessions.length).toBe(1);
    expect(sessions[0]?.deviceId).toBe(deviceInfo.deviceId);

    // Verify refresh token was created
    const tokens = await prisma.refreshToken.findMany({
      where: { sessionId: sessions[0]!.id },
    });
    expect(tokens.length).toBe(1);
    expect(tokens[0]?.revokedAt).toBeNull();
  });

  it("should successfully login with valid credentials", async () => {
    // First register a user
    await authService.register({
      ...userData,
      ...deviceInfo,
    });

    // Now test login
    const loginResult = await authService.login({
      email: userData.email,
      password: userData.password,
      ...deviceInfo,
    });

    // Verify response structure
    expect(loginResult).toHaveProperty("user");
    expect(loginResult).toHaveProperty("accessToken");
    expect(loginResult).toHaveProperty("refreshToken");

    // Verify user data
    expect(loginResult.user.email).toBe(userData.email);
    expect(loginResult.user.fullName).toBe(userData.fullName);
    expect(loginResult.user).toHaveProperty("id");
    expect(loginResult.user).toHaveProperty("role");

    // Verify tokens are strings and not empty
    expect(typeof loginResult.accessToken).toBe("string");
    expect(loginResult.accessToken.length).toBeGreaterThan(0);
    expect(typeof loginResult.refreshToken).toBe("string");
    expect(loginResult.refreshToken.length).toBeGreaterThan(0);

    // Verify session was created/updated
    const dbUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    const sessions = await prisma.session.findMany({
      where: { userId: dbUser!.id, revokedAt: null },
    });
    expect(sessions.length).toBeGreaterThan(0);

    // Verify at least one active session exists
    const activeSession = sessions.find(
      (s) => s.deviceId === deviceInfo.deviceId
    );
    expect(activeSession).toBeDefined();
  });

  it("should register and then login successfully", async () => {
    // Register
    const registerResult = await authService.register({
      ...userData,
      email: "registerlogin@example.com",
      ...deviceInfo,
    });

    expect(registerResult.user.email).toBe("registerlogin@example.com");
    expect(registerResult.accessToken).toBeDefined();
    expect(registerResult.refreshToken).toBeDefined();

    // Login with the same credentials
    const loginResult = await authService.login({
      email: "registerlogin@example.com",
      password: userData.password,
      ...deviceInfo,
    });

    expect(loginResult.user.email).toBe("registerlogin@example.com");
    expect(loginResult.accessToken).toBeDefined();
    expect(loginResult.refreshToken).toBeDefined();

    // Verify both operations returned valid tokens
    expect(registerResult.accessToken).not.toBe(loginResult.accessToken);
    expect(registerResult.refreshToken).not.toBe(loginResult.refreshToken);
  });
});
