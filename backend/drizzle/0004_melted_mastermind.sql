ALTER TABLE "plans" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plan_days" ADD COLUMN "name" text DEFAULT '' NOT NULL;