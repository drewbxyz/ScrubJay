CREATE TABLE "channel_rss_subscriptions" (
	"active" boolean DEFAULT true NOT NULL,
	"channel_id" text NOT NULL,
	"id" text
);
--> statement-breakpoint
CREATE TABLE "rss_items" (
	"content_html" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"description" text,
	"id" text NOT NULL,
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP,
	"link" text,
	"published_at" timestamp,
	"title" text
);
--> statement-breakpoint
CREATE TABLE "rss_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "channel_rss_subscriptions" ADD CONSTRAINT "channel_rss_subscriptions_id_rss_sources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."rss_sources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rss_items" ADD CONSTRAINT "rss_items_id_rss_sources_id_fk" FOREIGN KEY ("id") REFERENCES "public"."rss_sources"("id") ON DELETE cascade ON UPDATE cascade;