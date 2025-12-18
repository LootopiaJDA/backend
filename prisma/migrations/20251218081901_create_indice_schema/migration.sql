-- CreateTable
CREATE TABLE "Indice" (
    "id" SERIAL NOT NULL,
    "chasse_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "long" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Indice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Indice" ADD CONSTRAINT "Indice_chasse_id_fkey" FOREIGN KEY ("chasse_id") REFERENCES "Chasse"("id_chasse") ON DELETE RESTRICT ON UPDATE CASCADE;
