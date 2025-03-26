ALTER TABLE "exercises" ALTER COLUMN "equipment" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."exercises" ALTER COLUMN "equipment" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."equipment_enum";--> statement-breakpoint
CREATE TYPE "public"."equipment_enum" AS ENUM('body only', 'machine', 'other', 'foam roll', 'kettlebells', 'dumbbell', 'cable', 'barbell', 'bands', 'medicine ball', 'exercise ball', 'e-z curl bar');--> statement-breakpoint
ALTER TABLE "public"."exercises" ALTER COLUMN "equipment" SET DATA TYPE "public"."equipment_enum" USING "equipment"::"public"."equipment_enum";