-- CreateTable
CREATE TABLE "Images" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "Description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Images_title_key" ON "Images"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Images_imageUrl_key" ON "Images"("imageUrl");

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
