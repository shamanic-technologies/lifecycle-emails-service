import { pgTable, uuid, text, timestamp, uniqueIndex, index, jsonb } from "drizzle-orm/pg-core";

export const emailEvents = pgTable(
  "email_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appId: text("app_id").notNull(),
    eventType: text("event_type").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    dedupKey: text("dedup_key"),
    clerkUserId: text("clerk_user_id"),
    clerkOrgId: text("clerk_org_id"),
    status: text("status").notNull().default("sent"),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_email_events_dedup").on(table.dedupKey),
    index("idx_email_events_app_type").on(table.appId, table.eventType),
    index("idx_email_events_recipient").on(table.recipientEmail),
  ]
);

export type EmailEvent = typeof emailEvents.$inferSelect;
export type NewEmailEvent = typeof emailEvents.$inferInsert;
