CREATE TABLE "vybe_portfolio_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" uuid NOT NULL,
	"photo_url" text NOT NULL,
	"caption" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vybe_users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "vybe_portfolio_photos" ADD CONSTRAINT "vybe_portfolio_photos_provider_id_vybe_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."vybe_providers"("id") ON DELETE cascade ON UPDATE no action;