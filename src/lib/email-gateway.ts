const EMAIL_GATEWAY_URL = process.env.EMAIL_GATEWAY_URL || "https://email-sending.mcpfactory.org";
const EMAIL_GATEWAY_API_KEY = process.env.EMAIL_GATEWAY_API_KEY;

interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  tag: string;
  orgId?: string;
  runId: string;
  appId: string;
  brandId?: string;
  campaignId?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!EMAIL_GATEWAY_API_KEY) {
    throw new Error("EMAIL_GATEWAY_API_KEY is not configured");
  }

  const response = await fetch(`${EMAIL_GATEWAY_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": EMAIL_GATEWAY_API_KEY,
    },
    body: JSON.stringify({
      type: "transactional",
      appId: params.appId,
      ...(params.brandId && { brandId: params.brandId }),
      ...(params.campaignId && { campaignId: params.campaignId }),
      runId: params.runId,
      ...(params.orgId && { clerkOrgId: params.orgId }),
      to: params.to,
      recipientFirstName: "",
      recipientLastName: "",
      recipientCompany: "",
      subject: params.subject,
      htmlBody: params.htmlBody,
      textBody: params.textBody,
      tag: params.tag,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Email sending failed (${response.status}): ${JSON.stringify(errorBody)}`);
  }
}
