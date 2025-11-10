/*
  Warnings:

  - Added the required column `localisation` to the `Materiel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Materiel" ADD COLUMN     "localisation" TEXT NOT NULL;
