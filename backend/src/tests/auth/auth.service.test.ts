import { authService } from "../../modules/auth/auth.service.js";

describe("AuthService", () => {
  const deviceA = { deviceId: "A", userAgent: "UA", ipAddress: "1.1.1.1" };
  const deviceB = { deviceId: "B", userAgent: "UA", ipAddress: "2.2.2.2" };

  it("registers user and creates session", async () => {
    const res = await authService.register({
      fullName: "John",
      email: "john@test.com",
      password: "password",
      phoneNumber: "123",
      ...deviceA,
    });

    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();
  });

  it("refresh token rotates", async () => {
    const { refreshToken } = await authService.login({
      email: "john@test.com",
      password: "password",
      ...deviceA,
    });

    const rotated = await authService.refreshToken(
      refreshToken,
      deviceA.deviceId
    );

    expect(rotated.refreshToken).not.toEqual(refreshToken);
  });

  it("detects refresh token reuse", async () => {
    const { refreshToken } = await authService.login({
      email: "john@test.com",
      password: "password",
      ...deviceA,
    });

    await authService.refreshToken(refreshToken, deviceA.deviceId);

    await expect(
      authService.refreshToken(refreshToken, deviceA.deviceId)
    ).rejects.toThrow("reuse");
  });

  it("detects device mismatch", async () => {
    const { refreshToken } = await authService.login({
      email: "john@test.com",
      password: "password",
      ...deviceA,
    });

    await expect(
      authService.refreshToken(refreshToken, deviceB.deviceId)
    ).rejects.toThrow("device");
  });
});
