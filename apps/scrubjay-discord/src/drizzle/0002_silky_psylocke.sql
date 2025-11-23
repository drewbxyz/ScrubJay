ALTER TABLE "rss_items" DROP CONSTRAINT "rss_items_id_rss_sources_id_fk";
--> statement-breakpoint
ALTER TABLE "rss_items" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "rss_items" ADD COLUMN "source_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "rss_items" ADD CONSTRAINT "rss_items_source_id_rss_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."rss_sources"("id") ON DELETE cascade ON UPDATE cascade;