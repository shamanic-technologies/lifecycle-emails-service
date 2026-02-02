import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function welcome(_metadata?: Record<string, unknown>): TemplateResult {
  return {
    subject: "Welcome to MCP Factory!",
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Welcome aboard!</h1>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Your MCP Factory account is ready. You can now create campaigns, find leads, and automate your outreach.
      </p>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Get started:
      </p>
      
      <ul style="color: #4a4a4a; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
        <li><a href="https://app.mcpfactory.org" style="color: #6366f1;">Open your dashboard</a></li>
        <li><a href="https://docs.mcpfactory.org" style="color: #6366f1;">Read the documentation</a></li>
      </ul>
    `),
    textBody: `Welcome aboard!

Your MCP Factory account is ready. You can now create campaigns, find leads, and automate your outreach.

Get started:
- Open your dashboard: https://app.mcpfactory.org
- Read the documentation: https://docs.mcpfactory.org

MCP Factory - The DFY, BYOK MCP Platform`,
  };
}
