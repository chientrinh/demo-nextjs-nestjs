-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'ANALYST');

-- CreateEnum
CREATE TYPE "RevenueSource" AS ENUM ('POS', 'EATCLUB');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('FOH', 'BOH', 'MANAGEMENT', 'STEWARD');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH_TILL', 'BANK_TRANSFER', 'PETTY_CASH');

-- CreateEnum
CREATE TYPE "WorkShift" AS ENUM ('CA_NGAY', 'CA_TRUA', 'CA_TOI', 'CA_DEM');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ANALYST',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue_entries" (
    "id" UUID NOT NULL,
    "entry_date" DATE NOT NULL,
    "source" "RevenueSource" NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "covers" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revenue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labour_costs" (
    "id" UUID NOT NULL,
    "expense_date" DATE NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "department" "Department" NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "note" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labour_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_annotations" (
    "id" UUID NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "source" "RevenueSource" NOT NULL,
    "amount" DECIMAL(15,0) NOT NULL,
    "event_date" DATE NOT NULL,
    "shift" "WorkShift" NOT NULL,
    "note" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_annotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "revenue_entries_entry_date_source_key" ON "revenue_entries"("entry_date", "source");

-- CreateIndex
CREATE INDEX "labour_costs_expense_date_idx" ON "labour_costs"("expense_date");

-- CreateIndex
CREATE INDEX "labour_costs_department_idx" ON "labour_costs"("department");

-- CreateIndex
CREATE INDEX "event_annotations_event_date_idx" ON "event_annotations"("event_date");

-- AddForeignKey
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labour_costs" ADD CONSTRAINT "labour_costs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_annotations" ADD CONSTRAINT "event_annotations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
