import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function jMinus3(metadata?: Record<string, unknown>): TemplateResult {
  const productName = (metadata?.productName as string) || "the webinar";
  const eventDate = (metadata?.eventDate as string) || "";

  return {
    subject: `3 days until ${productName}`,
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">3 days to go!</h1>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <strong>${productName}</strong> is in 3 days${eventDate ? ` (${eventDate})` : ""}.
      </p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        Make sure to mark your calendar. See you there!
      </p>
    `),
    textBody: `3 days to go!

${productName} is in 3 days${eventDate ? ` (${eventDate})` : ""}.

Make sure to mark your calendar. See you there!`,
  };
}
