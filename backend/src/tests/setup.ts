import { prisma } from "../config/db.js";
import "dotenv/config";

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
