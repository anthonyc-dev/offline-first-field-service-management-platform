// import { authService } from "../../modules/auth/auth.service.js";
// import { prisma } from "../../tests/setup.js";
// import { hashToken } from "../../shared/utils/tokens.js";

// describe("AuthService Integration Tests", () => {
//   const deviceA = { deviceId: "A", userAgent: "UA", ipAddress: "1.1.1.1" };
//   const deviceB = { deviceId: "B", userAgent: "UA", ipAddress: "2.2.2.2" };

//   const userData = {
//     fullName: "John Doe",
//     email: "john@test.com",
//     password: "Password123!",
//     phoneNumber: "1234567890",
//   };

//   it("registers a user and creates session + refresh token", async () => {
//     const res = await authService.register({ ...userData, ...deviceA });

//     expect(res.user.email).toBe(userData.email);
//     expect(res.accessToken).toBeDefined();
//     expect(res.refreshToken).toBeDefined();

//     const dbUser = await prisma.user.findUnique({
//       where: { email: userData.email },
//     });
//     expect(dbUser).not.toBeNull();

//     const sessions = await prisma.session.findMany({
//       where: { userId: dbUser!.id },
//     });
//     expect(sessions.length).toBe(1);

//     const tokens = await prisma.refreshToken.findMany({
//       where: { sessionId: sessions[0]!.id },
//     });
//     expect(tokens.length).toBe(1);
//   });

//   it("login successfully and creates session", async () => {
//     await authService.register({ ...userData, ...deviceA });

//     const loginRes = await authService.login({ ...userData, ...deviceA });
//     expect(loginRes.accessToken).toBeDefined();
//     expect(loginRes.refreshToken).toBeDefined();

//     const sessions = await prisma.session.findMany({
//       where: { userId: loginRes.user.id },
//     });
//     expect(sessions.length).toBe(1);
//   });

//   it("refresh token rotates correctly", async () => {
//     await authService.register({ ...userData, ...deviceA });

//     const loginRes = await authService.login({ ...userData, ...deviceA });
//     const oldToken = loginRes.refreshToken;

//     const rotated = await authService.refreshToken(oldToken, deviceA.deviceId);
//     expect(rotated.refreshToken).not.toEqual(oldToken);

//     const oldTokenRecord = await prisma.refreshToken.findUnique({
//       where: { tokenHash: hashToken(oldToken) },
//     });
//     expect(oldTokenRecord!.revokedAt).not.toBeNull();
//   });

//   it("detects refresh token reuse", async () => {
//     await authService.register({ ...userData, ...deviceA });

//     const loginRes = await authService.login({ ...userData, ...deviceA });
//     const oldToken = loginRes.refreshToken;

//     await authService.refreshToken(oldToken, deviceA.deviceId);

//     await expect(
//       authService.refreshToken(oldToken, deviceA.deviceId)
//     ).rejects.toThrow("reuse");
//   });

//   it("detects device mismatch on refresh", async () => {
//     await authService.register({ ...userData, ...deviceA });

//     const loginRes = await authService.login({ ...userData, ...deviceA });

//     await expect(
//       authService.refreshToken(loginRes.refreshToken, deviceB.deviceId)
//     ).rejects.toThrow("device");
//   });

//   it("limits active sessions to 5", async () => {
//     await authService.register({ ...userData, ...deviceA });

//     // Login 5 times with different devices
//     for (let i = 0; i < 4; i++) {
//       await authService.login({
//         ...userData,
//         deviceId: `dev-${i}`,
//         userAgent: "UA",
//         ipAddress: "1.1.1.1",
//       });
//     }

//     // 6th login should fail
//     await expect(
//       authService.login({
//         ...userData,
//         deviceId: "dev-5",
//         userAgent: "UA",
//         ipAddress: "1.1.1.1",
//       })
//     ).rejects.toThrow("Too many active sessions");
//   });

//   it("logs out a single session", async () => {
//     await authService.register({ ...userData, ...deviceA });
//     const loginRes = await authService.login({ ...userData, ...deviceA });

//     await authService.logout(loginRes.refreshToken);

//     const token = await prisma.refreshToken.findUnique({
//       where: { tokenHash: hashToken(loginRes.refreshToken) },
//     });
//     expect(token!.revokedAt).not.toBeNull();
//   });

//   it("logs out all sessions", async () => {
//     await authService.register({ ...userData, ...deviceA });
//     await authService.login({ ...userData, ...deviceB });

//     const user = await prisma.user.findUnique({
//       where: { email: userData.email },
//     })!;
//     await authService.logoutAll(user!.id);

//     const sessions = await prisma.session.findMany({
//       where: { userId: user!.id, revokedAt: null },
//     });
//     expect(sessions.length).toBe(0);

//     const tokens = await prisma.refreshToken.findMany({
//       where: { session: { userId: user!.id }, revokedAt: null },
//     });
//     expect(tokens.length).toBe(0);
//   });
// });
