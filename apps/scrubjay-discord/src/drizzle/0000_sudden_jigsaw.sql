CREATE TABLE "channel_ebird_subscriptions" (
	"channel_id" text NOT NULL,
	"state_code" text NOT NULL,
	"county_code" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "channel_ebird_subscriptions_channel_id_state_code_county_code_pk" PRIMARY KEY("channel_id","state_code","county_code")
);
--> statement-breakpoint
CREATE TABLE "county_timezones" (
	"county_code" text PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'America/Los_Angeles' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"alert_kind" text NOT NULL,
	"alert_id" text NOT NULL,
	"channel_id" text NOT NULL,
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "filtered_species" (
	"common_name" text NOT NULL,
	"channel_id" text NOT NULL,
	CONSTRAINT "filtered_species_common_name_channel_id_pk" PRIMARY KEY("common_name","channel_id")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"county" text NOT NULL,
	"county_code" text NOT NULL,
	"state" text NOT NULL,
	"state_code" text NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"name" text NOT NULL,
	"is_private" boolean NOT NULL,
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"species_code" text NOT NULL,
	"sub_id" text NOT NULL,
	"common_name" text NOT NULL,
	"scientific_name" text NOT NULL,
	"location_id" text NOT NULL,
	"observation_date" timestamp NOT NULL,
	"how_many" integer NOT NULL,
	"observation_valid" boolean NOT NULL,
	"observation_reviewed" boolean NOT NULL,
	"presence_noted" boolean NOT NULL,
	"photo_count" integer DEFAULT 0 NOT NULL,
	"audio_count" integer DEFAULT 0 NOT NULL,
	"video_count" integer DEFAULT 0 NOT NULL,
	"has_comments" boolean NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "observations_species_code_sub_id_pk" PRIMARY KEY("species_code","sub_id")
);
--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "state_county_idx" ON "channel_ebird_subscriptions" USING btree ("state_code","county_code");--> statement-breakpoint
CREATE INDEX "active_state_county_idx" ON "channel_ebird_subscriptions" USING btree ("active","state_code","county_code");--> statement-breakpoint
CREATE INDEX "county_code_idx" ON "county_timezones" USING btree ("county_code");--> statement-breakpoint
CREATE UNIQUE INDEX "deliveries_unique_idx" ON "deliveries" USING btree ("alert_kind","alert_id","channel_id");--> statement-breakpoint
CREATE INDEX "deliveries_channel_idx" ON "deliveries" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "common_name_channel_id_idx" ON "filtered_species" USING btree ("common_name","channel_id");--> statement-breakpoint
CREATE INDEX "county_state_code_idx" ON "locations" USING btree ("county_code","state_code");--> statement-breakpoint
CREATE INDEX "obs_created_at_idx" ON "observations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "obs_location_date_idx" ON "observations" USING btree ("location_id","observation_date");--> statement-breakpoint
CREATE INDEX "obs_review_valid_date_idx" ON "observations" USING btree ("observation_reviewed","observation_valid","observation_date");