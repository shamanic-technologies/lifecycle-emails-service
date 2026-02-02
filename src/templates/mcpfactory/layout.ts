/**
 * Shared HTML email layout for MCP Factory emails.
 */
export function wrapInLayout(content: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <img src="https://mcpfactory.org/logo-title.jpg" alt="MCP Factory" style="width: 180px; margin-bottom: 30px;" />
      ${content}
      <p style="color: #888; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        MCP Factory - The DFY, BYOK MCP Platform
      </p>
    </div>
  `;
}
