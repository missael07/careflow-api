/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Clinic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,clinicId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Clinic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Clinic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');

-- DropIndex
DROP INDEX "Clinic_name_key";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "licenseExpiresAt" TIMESTAMP(3),
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'BASIC',
ADD COLUMN     "status" "ClinicStatus" NOT NULL DEFAULT 'TRIAL',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_email_key" ON "Clinic"("email");

-- CreateIndex
CREATE INDEX "Patient_clinicId_idx" ON "Patient"("clinicId");

-- CreateIndex
CREATE INDEX "User_clinicId_idx" ON "User"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_clinicId_key" ON "User"("email", "clinicId");
