-- CreateEnum
CREATE TYPE "LobbyState" AS ENUM ('WAITING_FOR_PLAYERS', 'READY_TO_START', 'VOTING', 'RESULTS', 'DONE');

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
    "id" SERIAL NOT NULL,
    "lobby_code" TEXT NOT NULL,
    "state" "LobbyState" NOT NULL DEFAULT 'WAITING_FOR_PLAYERS',
    "owner_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "postal_code" TEXT NULL,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "RecommendationCategory" NOT NULL,
    "price_range_low" DOUBLE PRECISION,
    "price_range_high" DOUBLE PRECISION,
    "suggested_by_uuid" TEXT,
    "custom_lobby_id" INTEGER,
    "postal_code" TEXT NULL,
    "latitude" DOUBLE PRECISION NULL,
    "longitude" DOUBLE PRECISION NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkipRecommendation" (
    "lobby_id" INTEGER NOT NULL,
    "uuid" TEXT NOT NULL,

    CONSTRAINT "SkipRecommendation_pkey" PRIMARY KEY ("lobby_id","uuid")
);

-- CreateTable
CREATE TABLE "Vote" (
    "user_uuid" TEXT NOT NULL,
    "lobby_id" INTEGER NOT NULL,
    "yes_vote" BOOLEAN NOT NULL DEFAULT true,
    "recommendation_id" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("user_uuid","lobby_id","recommendation_id")
);

-- CreateTable
CREATE TABLE "_lobby_participant" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_generated_recommendations" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_lobby_picks" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_lobby_participant_AB_unique" ON "_lobby_participant"("A", "B");

-- CreateIndex
CREATE INDEX "_lobby_participant_B_index" ON "_lobby_participant"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_generated_recommendations_AB_unique" ON "_generated_recommendations"("A", "B");

-- CreateIndex
CREATE INDEX "_generated_recommendations_B_index" ON "_generated_recommendations"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_lobby_picks_AB_unique" ON "_lobby_picks"("A", "B");

-- CreateIndex
CREATE INDEX "_lobby_picks_B_index" ON "_lobby_picks"("B");

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_owner_uuid_fkey" FOREIGN KEY ("owner_uuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_suggested_by_uuid_fkey" FOREIGN KEY ("suggested_by_uuid") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_custom_lobby_id_fkey" FOREIGN KEY ("custom_lobby_id") REFERENCES "Lobby"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkipRecommendation" ADD CONSTRAINT "SkipRecommendation_lobby_id_fkey" FOREIGN KEY ("lobby_id") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkipRecommendation" ADD CONSTRAINT "SkipRecommendation_uuid_fkey" FOREIGN KEY ("uuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_lobby_id_fkey" FOREIGN KEY ("lobby_id") REFERENCES "Lobby"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_recommendation_id_fkey" FOREIGN KEY ("recommendation_id") REFERENCES "Recommendation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lobby_participant" ADD CONSTRAINT "_lobby_participant_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lobby_participant" ADD CONSTRAINT "_lobby_participant_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_generated_recommendations" ADD CONSTRAINT "_generated_recommendations_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_generated_recommendations" ADD CONSTRAINT "_generated_recommendations_B_fkey" FOREIGN KEY ("B") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lobby_picks" ADD CONSTRAINT "_lobby_picks_A_fkey" FOREIGN KEY ("A") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lobby_picks" ADD CONSTRAINT "_lobby_picks_B_fkey" FOREIGN KEY ("B") REFERENCES "Recommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

