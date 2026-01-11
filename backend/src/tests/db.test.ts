// import { newDb } from "pg-mem";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { Pool } from "pg";
// import { PrismaClient } from "../generated/prisma/client.js";

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === "test") {
//   // Create an in-memory Postgres DB
//   const db = newDb({ autoCreateForeignKeyIndices: true });

//   // Optionally create tables manually (pg-mem can auto-create from Prisma schema too)
//   db.public.none(`
//     CREATE TABLE "User" (
//       id SERIAL PRIMARY KEY,
//       "fullName" TEXT NOT NULL,
//       email TEXT NOT NULL UNIQUE,
//       password TEXT NOT NULL,
//       "phoneNumber" TEXT,
//       "createdAt" TIMESTAMP DEFAULT now()
//     );
//     CREATE TABLE "RefreshToken" (
//       id SERIAL PRIMARY KEY,
//       token TEXT NOT NULL,
//       "userId" INTEGER REFERENCES "User"(id),
//       "deviceId" TEXT
//     );
//   `);

//   // Get a Postgres connection URL from pg-mem (types omit connectionString)
//   const pg = db.adapters.createPg();
//   const connectionString = (pg as unknown as { connectionString: string })
//     .connectionString;

//   // Override process.env for Prisma
//   process.env.DATABASE_URL = connectionString;

//   // Create a pg-mem-backed Pool and Prisma adapter
//   const pool = new pg.Pool({ connectionString });
//   const adapter = new PrismaPg(pool);
//   prisma = new PrismaClient({ adapter });
// } else {
//   // Default to the real Postgres connection
//   const connectionString = `${process.env.DATABASE_URL}`;
//   const pool = new Pool({ connectionString });
//   const adapter = new PrismaPg(pool);
//   prisma = new PrismaClient({ adapter });
// }

// export { prisma };
