const POSTMARK_SERVICE_URL = process.env.POSTMARK_SERVICE_URL || "https://postmark.mcpfactory.org";
const POSTMARK_SERVICE_API_KEY = process.env.POSTMARK_SERVICE_API_KEY;
const BCC_EMAIL = "kevin@mcpfactory.org";
const FROM_EMAIL = "MCP Factory <hello@mcpfactory.org>";

interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  tag: string;
}

export async function sendViaPostmark(params: SendEmailParams): Promise<void> {
  if (!POSTMARK_SERVICE_API_KEY) {
    throw new Error("POSTMARK_SERVICE_API_KEY is not configured");
  }

  const response = await fetch(`${POSTMARK_SERVICE_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": POSTMARK_SERVICE_API_KEY,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      bcc: BCC_EMAIL,
      subject: params.subject,
      htmlBody: params.htmlBody,
      textBody: params.textBody,
      tag: params.tag,
      trackOpens: false,
      trackLinks: "None",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Postmark send failed (${response.status}): ${JSON.stringify(errorBody)}`);
  }
}
