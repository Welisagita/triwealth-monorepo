/*
  Warnings:

  - Made the column `riskProfile` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "kycDocumentUrl" TEXT,
ALTER COLUMN "riskProfile" SET NOT NULL,
ALTER COLUMN "riskProfile" SET DEFAULT 'CONSERVATIVE';
