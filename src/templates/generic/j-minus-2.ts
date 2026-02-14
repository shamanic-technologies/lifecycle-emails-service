import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function jMinus2(metadata?: Record<string, unknown>): TemplateResult {
  const productName = (metadata?.productName as string) || "the webinar";
  const eventDate = (metadata?.eventDate as string) || "";

  return {
    subject: `2 days until ${productName}`,
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">2 days to go!</h1>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <strong>${productName}</strong> is in 2 days${eventDate ? ` (${eventDate})` : ""}.
      </p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        Get ready — we're almost there!
      </p>
    `),
    textBody: `2 days to go!

${productName} is in 2 days${eventDate ? ` (${eventDate})` : ""}.

Get ready — we're almost there!`,
  };
}
