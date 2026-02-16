import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function welcome(_metadata?: Record<string, unknown>): TemplateResult {
  return {
    subject: "Welcome to kevinlourd.com!",
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Welcome!</h1>

      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thanks for signing up. Your account is ready to go.
      </p>

      <a href="https://kevinlourd.com" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
        Get started
      </a>
    `),
    textBody: `Welcome!

Thanks for signing up. Your account is ready to go.

Get started: https://kevinlourd.com`,
  };
}
