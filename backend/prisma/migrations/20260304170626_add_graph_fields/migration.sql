-- AlterTable
ALTER TABLE "ConceptRelation" ADD COLUMN     "relationshipStrength" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sharedTagsCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "relationshipType" SET DEFAULT 'tag-match';
