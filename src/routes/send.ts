import { Router } from "express";
import { requireApiKey } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { emailEvents } from "../db/schema.js";
import { getTemplate } from "../templates/index.js";
import { sendViaPostmark } from "../lib/postmark.js";
import { resolveUserEmail, resolveOrgEmails } from "../lib/clerk.js";
import {
  ensureOrganization,
  createRun,
  updateRun,
} from "../lib/runs-client.js";
import { SendRequestSchema } from "../schemas.js";

const router = Router();

// Event types that are deduped (sent only once per key)
const ONCE_ONLY_EVENTS = new Set(["waitlist", "welcome", "signup_notification"]);

// Event types deduped per day (one per user per day)
const DAILY_DEDUP_EVENTS = new Set(["user_active"]);

// Events where recipient is hardcoded to admin
const ADMIN_EMAIL = "kevin@mcpfactory.org";
const ADMIN_NOTIFICATION_EVENTS = new Set(["signup_notification", "signin_notification", "user_active"]);

// System org ID for runs without a user org (admin notifications, etc.)
const SYSTEM_ORG_ID = "lifecycle-emails-service";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function buildDedupKey(appId: string, eventType: string, req: { clerkUserId?: string; recipientEmail?: string }): string | null {
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
    const parsed = SendRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    const body = parsed.data;

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
    const metadata = { ...body.metadata };
    if (ADMIN_NOTIFICATION_EVENTS.has(body.eventType) && body.clerkUserId && !metadata.email) {
      try {
        const userEmail = await resolveUserEmail(body.clerkUserId);
        metadata.email = userEmail;
      } catch {
        // Continue without email in metadata
      }
    }

    // Get template
    const templateFn = getTemplate(body.appId, body.eventType);
    const template = templateFn(metadata as Record<string, unknown>);

    const dedupKey = buildDedupKey(body.appId, body.eventType, body);
    const results: Array<{ email: string; sent: boolean; reason?: string }> = [];

    for (const email of recipientEmails) {
      // Build per-recipient dedup key (append email for org-wide sends)
      const recipientDedupKey = dedupKey && recipientEmails.length > 1
        ? `${dedupKey}:${email}`
        : dedupKey;

      // Create a run in runs-service before sending
      const externalOrgId = body.clerkOrgId || SYSTEM_ORG_ID;
      let runsOrgId: string;
      let run: { id: string } | null = null;

      try {
        runsOrgId = await ensureOrganization(externalOrgId);
        run = await createRun({
          organizationId: runsOrgId,
          serviceName: "lifecycle-emails-service",
          taskName: `email-${body.eventType}`,
        });
      } catch (runErr: any) {
        console.error(`Failed to create run for ${body.eventType}:`, runErr.message);
        results.push({ email, sent: false, reason: `Run creation failed: ${runErr.message}` });
        continue;
      }

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
              metadata: metadata || null,
            })
            .onConflictDoNothing({ target: emailEvents.dedupKey })
            .returning();

          if (inserted.length === 0) {
            await updateRun(run.id, "completed");
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
            metadata: metadata || null,
          });
        }

        // Send via Postmark with the real run ID
        await sendViaPostmark({
          to: email,
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
          tag: `${body.appId}-${body.eventType}`,
          orgId: body.clerkOrgId ?? null,
          runId: run.id,
          appId: body.appId,
          brandId: body.brandId || "lifecycle",
          campaignId: body.campaignId || "lifecycle",
        });

        await updateRun(run.id, "completed");
        results.push({ email, sent: true });
      } catch (err: any) {
        console.error(`Failed to send ${body.eventType} to ${email}:`, err.message);

        // Mark run as failed
        try {
          await updateRun(run.id, "failed", err.message);
        } catch {
          // Best effort
        }

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
