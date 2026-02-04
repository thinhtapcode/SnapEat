-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStreakAt" TIMESTAMP(3);
