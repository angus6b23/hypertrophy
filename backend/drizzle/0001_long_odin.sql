ALTER TABLE "measurements" DROP CONSTRAINT "measurements_localId_unique";--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "owner_localId_unique" UNIQUE("local_id","owner_id");