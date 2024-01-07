-- CreateEnum
CREATE TYPE "LobbyState" AS ENUM ('CREATING_LOBBY', 'WAITING_FOR_PLAYERS', 'VOTING', 'RESULTS', 'DONE');

-- CreateEnum
CREATE TYPE "RecommendationCategory" AS ENUM ('DINING', 'ACTIVITY', 'EVENT', 'CUSTOM');

-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Lobby" (
    "id" TEXT NOT NULL,
    "lobby_code" TEXT NOT NULL,
    "state" "LobbyState" NOT NULL DEFAULT 'CREATING_LOBBY',
    "owner_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "RecommendationCategory" NOT NULL,
    "price_range_low" DOUBLE PRECISION NOT NULL,
    "price_range_high" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "lobby_id" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_owner_uuid_key" ON "Lobby"("owner_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_user_uuid_key" ON "Vote"("user_uuid");

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_owner_uuid_fkey" FOREIGN KEY ("owner_uuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_lobby_id_fkey" FOREIGN KEY ("lobby_id") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
