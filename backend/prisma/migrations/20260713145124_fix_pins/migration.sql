/*
  Warnings:

  - You are about to drop the column `nota` on the `Pin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pin" DROP COLUMN "nota",
ADD COLUMN     "note" TEXT;
