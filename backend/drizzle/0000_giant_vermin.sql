CREATE TYPE "public"."body_part_enum" AS ENUM('abdominals', 'hamstrings', 'calves', 'shoulders', 'adductors', 'glutes', 'quadriceps', 'biceps', 'forearms', 'abductors', 'triceps', 'chest', 'lower back', 'traps', 'middle back', 'lats', 'neck');--> statement-breakpoint
CREATE TYPE "public"."equipment_enum" AS ENUM('body only', 'machine', 'other', 'foam roll', 'kettlebells', 'dumbbell', 'cable', 'barbell', 'bands', 'medicine ball', 'exercise ball', 'e-z curl bar');--> statement-breakpoint
CREATE TYPE "public"."exercise_category_enum" AS ENUM('strength', 'stretching', 'plyometrics', 'strongman', 'powerlifting', 'cardio', 'olympic weightlifting');--> statement-breakpoint
CREATE TYPE "public"."exercise_level_enum" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."force_enum" AS ENUM('pull', 'push', 'static');--> statement-breakpoint
CREATE TYPE "public"."mechanics_enum" AS ENUM('compound', 'isolation');--> statement-breakpoint
CREATE TYPE "public"."record_type_enum" AS ENUM('reps_with_weight', 'reps', 'time', 'distance');--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mechanic" "mechanics_enum",
	"force" "force_enum",
	"category" "exercise_category_enum" NOT NULL,
	"primary_muscle" "body_part_enum" NOT NULL,
	"secondary_muscle" "body_part_enum"[] NOT NULL,
	"equipment" "equipment_enum",
	"record_type" "record_type_enum" NOT NULL,
	"description" text,
	"owner_id" uuid,
	CONSTRAINT "exercises_id_unique" UNIQUE("id"),
	CONSTRAINT "exercises_name_unique" UNIQUE("name")
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
	"local_id" text NOT NULL,
	"date" date NOT NULL,
	"weight" real,
	"height" real,
	"body_fat" real,
	"chest" real,
	"waist" real,
	"hip" real,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"owner_id" uuid NOT NULL,
	CONSTRAINT "measurements_id_unique" UNIQUE("id"),
	CONSTRAINT "owner_localId_unique" UNIQUE("local_id","owner_id")
);
--> statement-breakpoint
CREATE TABLE "oidc-sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"verifier" text NOT NULL,
	"code_challenge" text NOT NULL,
	"state" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oidc-sessions_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "plan_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" serial NOT NULL,
	"local_id" text NOT NULL,
	CONSTRAINT "plan_days_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "plan_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_id" serial NOT NULL,
	"exercise_id" serial NOT NULL,
	"target_sets" integer,
	"target_reps" integer,
	"rest_time" integer,
	CONSTRAINT "plan_exercises_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"local_id" text NOT NULL,
	"owner_id" uuid,
	"is_public" boolean DEFAULT false NOT NULL,
	"is_weekday" boolean DEFAULT true NOT NULL,
	CONSTRAINT "plans_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"display_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_oauth" boolean DEFAULT false NOT NULL,
	"oidc_email" text,
	"is_disabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_oidcEmail_unique" UNIQUE("oidc_email")
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_days" ADD CONSTRAINT "plan_days_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_day_id_plan_days_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."plan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE INDEX "username" ON "users" USING btree ("username");