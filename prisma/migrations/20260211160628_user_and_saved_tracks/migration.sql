-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_tracks_userId_idx" ON "saved_tracks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_tracks_userId_url_key" ON "saved_tracks"("userId", "url");

-- AddForeignKey
ALTER TABLE "saved_tracks" ADD CONSTRAINT "saved_tracks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
