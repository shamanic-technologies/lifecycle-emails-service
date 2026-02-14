import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function jDay(metadata?: Record<string, unknown>): TemplateResult {
  const productName = (metadata?.productName as string) || "the webinar";
  const joinUrl = (metadata?.joinUrl as string) || "";

  const joinLine = joinUrl
    ? `<p style="margin-top: 20px;"><a href="${joinUrl}" style="color: #fff; background: #6366f1; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">Join now</a></p>`
    : "";
  const joinLine_text = joinUrl ? `\nJoin here: ${joinUrl}` : "";

  return {
    subject: `It's today: ${productName}`,
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">It's happening today!</h1>
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <strong>${productName}</strong> starts today. Don't miss it!
      </p>
      ${joinLine}
    `),
    textBody: `It's happening today!

${productName} starts today. Don't miss it!${joinLine_text}`,
  };
}
