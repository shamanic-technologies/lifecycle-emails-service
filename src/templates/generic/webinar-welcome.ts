import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function webinarWelcome(metadata?: Record<string, unknown>): TemplateResult {
  const productName = (metadata?.productName as string) || "the webinar";
  const eventDate = (metadata?.eventDate as string) || "";

  const dateLine = eventDate ? `<p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Date: <strong>${eventDate}</strong></p>` : "";
  const dateLine_text = eventDate ? `\nDate: ${eventDate}` : "";

  return {
    subject: `You're registered for ${productName}!`,
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">You're in!</h1>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Your registration for <strong>${productName}</strong> is confirmed.
      </p>
      ${dateLine}
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-top: 20px;">
        We'll send you reminders as the event approaches. Stay tuned!
      </p>
    `),
    textBody: `You're in!

Your registration for ${productName} is confirmed.${dateLine_text}

We'll send you reminders as the event approaches. Stay tuned!`,
  };
}
