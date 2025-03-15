CREATE TYPE "public"."body_part_enum" AS ENUM('abdominals', 'hamstrings', 'calves', 'shoulders', 'adductors', 'glutes', 'quadriceps', 'biceps', 'forearms', 'abductors', 'triceps', 'chest', 'lower back', 'traps', 'middle back', 'lats', 'neck');--> statement-breakpoint
CREATE TYPE "public"."equipment_enum" AS ENUM('barbell', 'dumbbell', 'kettlebell', 'machine', 'other', 'body_weight', 'resistent_band', 'foam_roller', 'medicine_ball', 'e-z curl bar');--> statement-breakpoint
CREATE TYPE "public"."exercise_category_enum" AS ENUM('strength', 'stretching', 'plyometrics', 'strongman', 'powerlifting', 'cardio', 'olympic weightlifting');--> statement-breakpoint
CREATE TYPE "public"."exercise_level_enum" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."force_enum" AS ENUM('pull', 'push', 'static');--> statement-breakpoint
CREATE TYPE "public"."mechanics_enum" AS ENUM('compound', 'isolation');--> statement-breakpoint
CREATE TYPE "public"."record_type_enum" AS ENUM('reps_with_weight', 'reps', 'time', 'distance');--> statement-breakpoint
CREATE TYPE "public"."length_unit_enum" AS ENUM('inch', 'cm');--> statement-breakpoint
CREATE TYPE "public"."weight_unit_enum" AS ENUM('lb', 'kg');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mechanics" "mechanics_enum",
	"force" "force_enum",
	"category" "exercise_category_enum" NOT NULL,
	"primary_muscle" "body_part_enum"[] NOT NULL,
	"secondary_muscle" "body_part_enum"[] NOT NULL,
	"equipment" "equipment_enum"[] NOT NULL,
	"record_type" "record_type_enum" NOT NULL,
	"description" text,
	"owner_id" uuid,
	CONSTRAINT "exercises_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "keystore" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "keystore_id_unique" UNIQUE("id"),
	CONSTRAINT "keystore_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"weight" numeric,
	"weight_unit" "weight_unit_enum",
	"height" numeric,
	"height_unit" "length_unit_enum",
	"body_fat" numeric,
	"chest" numeric,
	"chest_unit" "length_unit_enum",
	"waist" numeric,
	"waist_unit" "length_unit_enum",
	"hip" numeric,
	"hip_unit" "length_unit_enum",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"owner_id" uuid NOT NULL,
	CONSTRAINT "measurements_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"display_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_oauth" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE INDEX "username" ON "users" USING btree ("username");