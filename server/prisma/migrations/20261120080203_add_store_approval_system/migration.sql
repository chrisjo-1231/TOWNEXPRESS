/*
  Warnings:

  - Added the required column `updatedAt` to the `StoreMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "StoreCategory" AS ENUM ('GROCERY', 'RESTAURANT', 'PHARMACY', 'WATER_STATION', 'CONVENIENCE_STORE', 'BAKERY', 'OTHER');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISABLED');

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "barangay" TEXT,
ADD COLUMN     "category" "StoreCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" "StoreStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "StoreMember" ADD COLUMN     "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Store_status_idx" ON "Store"("status");
