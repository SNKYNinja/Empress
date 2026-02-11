-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "client" BOOLEAN NOT NULL,
    "memory" INTEGER[],

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);
