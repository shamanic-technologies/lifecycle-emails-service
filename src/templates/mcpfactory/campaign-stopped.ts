import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function campaignStopped(metadata?: Record<string, unknown>): TemplateResult {
  const campaignName = (metadata?.campaignName as string) || "Your campaign";

  return {
    subject: `Campaign stopped: ${campaignName}`,
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Campaign stopped</h1>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Your campaign <strong>${campaignName}</strong> has been stopped.
      </p>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        You can resume it at any time from your dashboard.
      </p>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <a href="https://app.mcpfactory.org" style="color: #6366f1;">View in dashboard</a>
      </p>
    `),
    textBody: `Campaign stopped: ${campaignName}

Your campaign "${campaignName}" has been stopped. You can resume it at any time from your dashboard.

View in dashboard: https://app.mcpfactory.org

MCP Factory - The DFY, BYOK MCP Platform`,
  };
}
