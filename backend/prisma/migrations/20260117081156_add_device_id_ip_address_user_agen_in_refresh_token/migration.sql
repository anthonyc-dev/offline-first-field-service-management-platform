/*
  Warnings:

  - Added the required column `deviceId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipAddress` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAgent` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "deviceId" TEXT NOT NULL,
ADD COLUMN     "ipAddress" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT NOT NULL;
