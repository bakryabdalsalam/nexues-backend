/*
  Warnings:

  - The values [SUPER_ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `benefits` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `linkedIn` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `resume` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Profile` table. All the data in the column will be lost.
  - Made the column `salary` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `fullName` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('USER', 'ADMIN', 'COMPANY');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "benefits",
DROP COLUMN "requirements",
ALTER COLUMN "salary" SET NOT NULL,
ALTER COLUMN "remote" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
DROP COLUMN "education",
DROP COLUMN "experience",
DROP COLUMN "github",
DROP COLUMN "linkedIn",
DROP COLUMN "phoneNumber",
DROP COLUMN "portfolio",
DROP COLUMN "resume",
DROP COLUMN "skills",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
