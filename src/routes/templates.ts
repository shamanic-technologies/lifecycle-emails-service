import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { requireApiKey } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { emailTemplates } from "../db/schema.js";
import { DeployTemplatesRequestSchema } from "../schemas.js";

const router = Router();

router.put("/templates", requireApiKey, async (req, res) => {
  try {
    const parsed = DeployTemplatesRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
      return;
    }

    const { appId, templates } = parsed.data;
    const results: Array<{ name: string; action: "created" | "updated" }> = [];

    for (const tpl of templates) {
      const existing = await db
        .select({ id: emailTemplates.id })
        .from(emailTemplates)
        .where(and(eq(emailTemplates.appId, appId), eq(emailTemplates.name, tpl.name)))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(emailTemplates)
          .set({
            subject: tpl.subject,
            htmlBody: tpl.htmlBody,
            textBody: tpl.textBody,
            updatedAt: new Date(),
          })
          .where(eq(emailTemplates.id, existing[0].id));
        results.push({ name: tpl.name, action: "updated" });
      } else {
        await db.insert(emailTemplates).values({
          appId,
          name: tpl.name,
          subject: tpl.subject,
          htmlBody: tpl.htmlBody,
          textBody: tpl.textBody,
        });
        results.push({ name: tpl.name, action: "created" });
      }
    }

    res.json({ templates: results });
  } catch (error: any) {
    console.error("Deploy templates error:", error);
    res.status(500).json({ error: error.message || "Failed to deploy templates" });
  }
});

export default router;
