import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function jMinus1(metadata?: Record<string, unknown>): TemplateResult {
  const productName = (metadata?.productName as string) || "the webinar";
  const eventDate = (metadata?.eventDate as string) || "";

  return {
    subject: `Tomorrow: ${productName}`,
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">It's tomorrow!</h1>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <strong>${productName}</strong> is tomorrow${eventDate ? ` (${eventDate})` : ""}.
      </p>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        We can't wait to see you. Make sure everything is set!
      </p>
    `),
    textBody: `It's tomorrow!

${productName} is tomorrow${eventDate ? ` (${eventDate})` : ""}.

We can't wait to see you. Make sure everything is set!`,
  };
}
