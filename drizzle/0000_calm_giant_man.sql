CREATE TABLE IF NOT EXISTS "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" text NOT NULL,
	"event_type" text NOT NULL,
	"recipient_email" text NOT NULL,
	"dedup_key" text,
	"clerk_user_id" text,
	"clerk_org_id" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_email_events_dedup" ON "email_events" USING btree ("dedup_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_events_app_type" ON "email_events" USING btree ("app_id","event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_events_recipient" ON "email_events" USING btree ("recipient_email");