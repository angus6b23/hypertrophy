CREATE TABLE "workouts-exercise" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"record" json NOT NULL,
	"type" "record_type_enum" NOT NULL,
	CONSTRAINT "workouts-exercise_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"local_id" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"rpe" integer,
	"remarks" text,
	"owner_id" uuid NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"last_update" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workouts_id_unique" UNIQUE("id"),
	CONSTRAINT "owner_localId_unique" UNIQUE("local_id","owner_id")
);
--> statement-breakpoint
ALTER TABLE "keystore" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "keystore" CASCADE;--> statement-breakpoint
ALTER TABLE "plan_days" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "plan_days" ALTER COLUMN "day" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "plan_exercises" ALTER COLUMN "target_sets" SET DEFAULT 3;--> statement-breakpoint
ALTER TABLE "plan_exercises" ALTER COLUMN "target_reps" SET DEFAULT 10;--> statement-breakpoint
ALTER TABLE "plan_exercises" ALTER COLUMN "rest_time" SET DEFAULT 60;--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "owner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "last_update" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "workouts-exercise" ADD CONSTRAINT "workouts-exercise_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts-exercise" ADD CONSTRAINT "workouts-exercise_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "owner_localId_unique" UNIQUE("local_id","owner_id");--> statement-breakpoint
ALTER TABLE "public"."exercises" ALTER COLUMN "record_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."workouts-exercise" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."record_type_enum";--> statement-breakpoint
CREATE TYPE "public"."record_type_enum" AS ENUM('reps_with_weight', 'reps', 'time', 'cardio');--> statement-breakpoint
ALTER TABLE "public"."exercises" ALTER COLUMN "record_type" SET DATA TYPE "public"."record_type_enum" USING "record_type"::"public"."record_type_enum";--> statement-breakpoint
ALTER TABLE "public"."workouts-exercise" ALTER COLUMN "type" SET DATA TYPE "public"."record_type_enum" USING "type"::"public"."record_type_enum";