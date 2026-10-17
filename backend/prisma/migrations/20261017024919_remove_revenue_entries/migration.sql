/*
  Warnings:

  - You are about to drop the `revenue_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "revenue_entries" DROP CONSTRAINT "revenue_entries_created_by_id_fkey";

-- DropTable
DROP TABLE "revenue_entries";
