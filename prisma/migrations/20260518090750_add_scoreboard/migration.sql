CREATE TABLE "ScoreBoard" (
    "id_score" SERIAL NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_chasse" INTEGER NOT NULL,

    CONSTRAINT "ScoreBoard_pkey" PRIMARY KEY ("id_score")
);

-- CreateIndex
CREATE INDEX "ScoreBoard_id_user_idx" ON "ScoreBoard"("id_user");

-- CreateIndex
CREATE INDEX "ScoreBoard_id_chasse_idx" ON "ScoreBoard"("id_chasse");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreBoard_id_user_id_chasse_key" ON "ScoreBoard"("id_user", "id_chasse");

-- AddForeignKey
ALTER TABLE "ScoreBoard" ADD CONSTRAINT "ScoreBoard_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreBoard" ADD CONSTRAINT "ScoreBoard_id_chasse_fkey" FOREIGN KEY ("id_chasse") REFERENCES "Chasse"("id_chasse") ON DELETE RESTRICT ON UPDATE CASCADE;