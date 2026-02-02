import type { TemplateResult } from "../index.js";
import { wrapInLayout } from "./layout.js";

export function waitlist(_metadata?: Record<string, unknown>): TemplateResult {
  return {
    subject: "Welcome to the MCP Factory Waitlist!",
    htmlBody: wrapInLayout(`
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">You're on the list!</h1>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thanks for joining the MCP Factory waitlist. We'll notify you as soon as we're ready to launch.
      </p>
      
      <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        In the meantime, you can:
      </p>
      
      <ul style="color: #4a4a4a; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
        <li><a href="https://docs.mcpfactory.org" style="color: #6366f1;">Read the documentation</a></li>
        <li><a href="https://github.com/shamanic-technologies/mcpfactory" style="color: #6366f1;">Star us on GitHub</a></li>
      </ul>
    `),
    textBody: `You're on the list!

Thanks for joining the MCP Factory waitlist. We'll notify you as soon as we're ready to launch.

In the meantime, you can:
- Read the documentation: https://docs.mcpfactory.org
- Star us on GitHub: https://github.com/shamanic-technologies/mcpfactory

MCP Factory - The DFY, BYOK MCP Platform`,
  };
}
