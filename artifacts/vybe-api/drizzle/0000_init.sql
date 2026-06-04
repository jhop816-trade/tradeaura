CREATE TYPE "public"."vybe_booking_status" AS ENUM('pending', 'confirmed', 'declined', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vybe_provider_plan" AS ENUM('free', 'pro', 'elite');--> statement-breakpoint
CREATE TYPE "public"."vybe_user_role" AS ENUM('provider', 'client');--> statement-breakpoint
CREATE TABLE "vybe_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"status" "vybe_booking_status" DEFAULT 'pending' NOT NULL,
	"appointment_at" timestamp with time zone NOT NULL,
	"inspo_photo_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vybe_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text
);
--> statement-breakpoint
CREATE TABLE "vybe_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vybe_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"category" text NOT NULL,
	"avatar_url" text,
	"instagram_handle" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"plan" "vybe_provider_plan" DEFAULT 'free' NOT NULL,
	CONSTRAINT "vybe_providers_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vybe_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"provider_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vybe_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	"photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vybe_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "vybe_user_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vybe_users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "vybe_working_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" text,
	"close_time" text,
	"is_closed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vybe_bookings" ADD CONSTRAINT "vybe_bookings_provider_id_vybe_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."vybe_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_bookings" ADD CONSTRAINT "vybe_bookings_client_id_vybe_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."vybe_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_bookings" ADD CONSTRAINT "vybe_bookings_service_id_vybe_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."vybe_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_clients" ADD CONSTRAINT "vybe_clients_user_id_vybe_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."vybe_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_favorites" ADD CONSTRAINT "vybe_favorites_client_id_vybe_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."vybe_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_favorites" ADD CONSTRAINT "vybe_favorites_provider_id_vybe_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."vybe_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_providers" ADD CONSTRAINT "vybe_providers_user_id_vybe_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."vybe_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_reviews" ADD CONSTRAINT "vybe_reviews_booking_id_vybe_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."vybe_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_reviews" ADD CONSTRAINT "vybe_reviews_provider_id_vybe_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."vybe_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_reviews" ADD CONSTRAINT "vybe_reviews_client_id_vybe_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."vybe_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_services" ADD CONSTRAINT "vybe_services_provider_id_vybe_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."vybe_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vybe_working_hours" ADD CONSTRAINT "vybe_working_hours_provider_id_vybe_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."vybe_providers"("id") ON DELETE cascade ON UPDATE no action;