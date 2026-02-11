/*
  Warnings:

  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Client";

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "memory" INTEGER[],

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);
