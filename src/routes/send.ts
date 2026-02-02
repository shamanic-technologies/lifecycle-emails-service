import { Router } from "express";
import { requireApiKey } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { emailEvents } from "../db/schema.js";
import { getTemplate } from "../templates/index.js";
import { sendViaPostmark } from "../lib/postmark.js";
import { resolveUserEmail, resolveOrgEmails } from "../lib/clerk.js";

const router = Router();

// Event types that are deduped (sent only once per key)
const ONCE_ONLY_EVENTS = new Set(["waitlist", "welcome", "signup_notification"]);

// Event types deduped per day (one per user per day)
const DAILY_DEDUP_EVENTS = new Set(["user_active"]);

// Events where recipient is hardcoded to admin
const ADMIN_EMAIL = "kevin@mcpfactory.org";
const ADMIN_NOTIFICATION_EVENTS = new Set(["signup_notification", "signin_notification", "user_active"]);

interface SendRequest {
  appId: string;
  eventType: string;
  clerkUserId?: string;
  clerkOrgId?: string;
  recipientEmail?: string;
  metadata?: Record<string, unknown>;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function buildDedupKey(appId: string, eventType: string, req: SendRequest): string | null {
  // Daily dedup: one per user per day
  if (DAILY_DEDUP_EVENTS.has(eventType)) {
    const identifier = req.clerkUserId || req.recipientEmail || "unknown";
    return `${appId}:${eventType}:${identifier}:${getTodayDate()}`;
  }

  // Once-only dedup
  if (ONCE_ONLY_EVENTS.has(eventType)) {
    if (eventType === "waitlist" && req.recipientEmail) {
      return `${appId}:waitlist:${req.recipientEmail}`;
    }
    if (req.clerkUserId) {
      return `${appId}:${eventType}:${req.clerkUserId}`;
    }
  }

  return null; // repeatable event, no dedup
}

router.post("/send", requireApiKey, async (req, res) => {
  try {
    const body = req.body as SendRequest;

    if (!body.appId || !body.eventType) {
      res.status(400).json({ error: "appId and eventType are required" });
      return;
    }

    // Resolve recipient emails
    let recipientEmails: string[];

    if (ADMIN_NOTIFICATION_EVENTS.has(body.eventType)) {
      recipientEmails = [ADMIN_EMAIL];
    } else if (body.clerkUserId) {
      const email = await resolveUserEmail(body.clerkUserId);
      recipientEmails = [email];
    } else if (body.clerkOrgId) {
      recipientEmails = await resolveOrgEmails(body.clerkOrgId);
    } else if (body.recipientEmail) {
      recipientEmails = [body.recipientEmail];
    } else {
      res.status(400).json({ error: "One of clerkUserId, clerkOrgId, or recipientEmail is required" });
      return;
    }

    // For admin notifications, enrich metadata with the user's email
    if (ADMIN_NOTIFICATION_EVENTS.has(body.eventType) && body.clerkUserId && !body.metadata?.email) {
      try {
        const userEmail = await resolveUserEmail(body.clerkUserId);
        body.metadata = { ...body.metadata, email: userEmail };
      } catch {
        // Continue without email in metadata
      }
    }

    // Get template
    const templateFn = getTemplate(body.appId, body.eventType);
    const template = templateFn(body.metadata);

    const dedupKey = buildDedupKey(body.appId, body.eventType, body);
    const results: Array<{ email: string; sent: boolean; reason?: string }> = [];

    for (const email of recipientEmails) {
      // Build per-recipient dedup key (append email for org-wide sends)
      const recipientDedupKey = dedupKey && recipientEmails.length > 1
        ? `${dedupKey}:${email}`
        : dedupKey;

      try {
        // Insert with dedup
        if (recipientDedupKey) {
          const inserted = await db
            .insert(emailEvents)
            .values({
              appId: body.appId,
              eventType: body.eventType,
              recipientEmail: email,
              dedupKey: recipientDedupKey,
              clerkUserId: body.clerkUserId || null,
              clerkOrgId: body.clerkOrgId || null,
              status: "sent",
              metadata: body.metadata || null,
            })
            .onConflictDoNothing({ target: emailEvents.dedupKey })
            .returning();

          if (inserted.length === 0) {
            results.push({ email, sent: false, reason: "duplicate" });
            continue;
          }
        } else {
          // Repeatable event: just insert for history
          await db.insert(emailEvents).values({
            appId: body.appId,
            eventType: body.eventType,
            recipientEmail: email,
            dedupKey: null,
            clerkUserId: body.clerkUserId || null,
            clerkOrgId: body.clerkOrgId || null,
            status: "sent",
            metadata: body.metadata || null,
          });
        }

        // Send via Postmark
        await sendViaPostmark({
          to: email,
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
          tag: `${body.appId}-${body.eventType}`,
        });

        results.push({ email, sent: true });
      } catch (err: any) {
        console.error(`Failed to send ${body.eventType} to ${email}:`, err.message);

        // Update status to failed if we inserted a row
        try {
          if (recipientDedupKey) {
            const { eq } = await import("drizzle-orm");
            await db
              .update(emailEvents)
              .set({ status: "failed", errorMessage: err.message })
              .where(eq(emailEvents.dedupKey, recipientDedupKey));
          }
        } catch {
          // Best effort
        }

        results.push({ email, sent: false, reason: err.message });
      }
    }

    res.json({ results });
  } catch (error: any) {
    console.error("Send lifecycle email error:", error);
    res.status(500).json({ error: error.message || "Failed to send lifecycle email" });
  }
});

export default router;
