/**
 * Minimal HTML email layout for generic/unbranded emails.
 * The caller can pass branding via metadata if needed.
 */
export function wrapInLayout(content: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      ${content}
    </div>
  `;
}
