// // src/__tests__/setup/database.setup.ts
// import { MongoMemoryServer } from "mongodb-memory-server";
// import mongoose from "mongoose";

// let mongoServer: MongoMemoryServer;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const uri = mongoServer.getUri();
//   await mongoose.connect(uri);
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// beforeEach(async () => {
//   // Clear all collections before each test
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany({});
//   }
// });
