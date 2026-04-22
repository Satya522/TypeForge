ALTER TABLE "User"
ADD COLUMN "avatarUrl" TEXT,
ADD COLUMN "nickname" TEXT,
ADD COLUMN "handle" TEXT,
ADD COLUMN "profileNudgeDismissed" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");
