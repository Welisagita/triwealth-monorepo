/*
  Warnings:

  - Added the required column `content` to the `education_contents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "education_contents" ADD COLUMN     "content" TEXT NOT NULL;
