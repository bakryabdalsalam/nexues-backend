/*
  Warnings:

  - The values [ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `company` on the `Job` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'DRAFT');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'COMPANY', 'SUPER_ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- Create Company table first
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "website" TEXT,
    "location" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- Create unique index on Company
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- Create default company user for existing jobs
INSERT INTO "users" ("id", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt")
SELECT 
    'default-company-user',
    'system@example.com',
    'not-accessible',
    'System Company',
    'COMPANY',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "users" WHERE "id" = 'default-company-user'
);

-- Create default company for existing jobs
INSERT INTO "Company" ("id", "userId", "companyName", "createdAt", "updatedAt")
SELECT 
    'default-company',
    'default-company-user',
    'Legacy Company',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Company" WHERE "id" = 'default-company'
);

-- Add foreign key for Company
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Modify Job table
ALTER TABLE "Job" 
ADD COLUMN "benefits" TEXT[],
ADD COLUMN "requirements" TEXT[],
ADD COLUMN "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN "companyId" TEXT;

-- Update existing jobs to use default company
UPDATE "Job"
SET "companyId" = 'default-company'
WHERE "companyId" IS NULL;

-- Now make companyId required
ALTER TABLE "Job" 
ALTER COLUMN "companyId" SET NOT NULL;

-- Add foreign key for Job
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old company column
ALTER TABLE "Job" DROP COLUMN "company";

-- Modify Profile table
ALTER TABLE "Profile" 
ADD COLUMN "address" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "github" TEXT,
ADD COLUMN "linkedIn" TEXT,
ADD COLUMN "phoneNumber" TEXT,
ADD COLUMN "portfolio" TEXT;
