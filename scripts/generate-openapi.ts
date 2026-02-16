import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "../src/schemas";
import { writeFileSync } from "fs";

const generator = new OpenApiGeneratorV3(registry.definitions);

const document = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Transactional Email Service",
    description: `Transactional email service. Register templates once at startup, send event-triggered emails with deduplication and recipient resolution.

## Quick Start

**Step 1 — Deploy your email templates (once, at app startup):**
\`\`\`
PUT /templates
{
  "appId": "my-app",
  "templates": [
    { "name": "welcome", "subject": "Welcome {{name}}!", "htmlBody": "<h1>Hi {{name}}</h1>", "textBody": "Hi {{name}}" }
  ]
}
\`\`\`
This is idempotent — safe to call on every cold start. Templates are upserted by (appId + name).

**Step 2 — Send an email (each time an event occurs):**
\`\`\`
POST /send
{
  "appId": "my-app",
  "eventType": "welcome",
  "clerkUserId": "user_xxx",
  "metadata": { "name": "Alice" }
}
\`\`\`
The service resolves the recipient email via Clerk, renders the template with metadata, deduplicates, and delivers via the Email Gateway.

## Template Interpolation

Templates support \`{{variable}}\` placeholders. When sending, pass data via the \`metadata\` field — each key replaces the matching \`{{key}}\` in subject, htmlBody, and textBody.

## Recipient Resolution

One of these is required when sending:
- \`clerkUserId\` — resolves to the user's email via Clerk
- \`clerkOrgId\` — sends to all org members
- \`recipientEmail\` — direct email address

## Dedup Strategies

Dedup is based on event type:
- **Once-only** (waitlist, welcome, signup_notification): one send ever per user
- **Daily** (user_active): one send per user per day
- **Product-scoped** (webinar events): one send per user per product instance (requires \`productId\`)
- **Repeatable** (all others): no dedup, sent every time

## Setup Pattern (instrumentation.ts)

\`\`\`typescript
export async function register() {
  // Register email templates (idempotent upsert)
  await fetch(\`\${process.env.TRANSACTIONAL_EMAIL_SERVICE_URL}/templates\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.TRANSACTIONAL_EMAIL_SERVICE_API_KEY! },
    body: JSON.stringify({
      appId: "my-app",
      templates: [
        { name: "welcome", subject: "Welcome {{name}}!", htmlBody: "<h1>Hi {{name}}</h1>", textBody: "Hi {{name}}" },
      ]
    }),
  });
}
\`\`\`

**Required env vars:**
- \`TRANSACTIONAL_EMAIL_SERVICE_URL\` — service endpoint
- \`TRANSACTIONAL_EMAIL_SERVICE_API_KEY\` — API key for authentication`,
    version: "1.0.0",
  },
  servers: [
    { url: process.env.SERVICE_URL || "http://localhost:3000" },
  ],
  security: [],
});

// Add security scheme (zod-to-openapi doesn't have a direct API for this)
(document as any).components = {
  ...(document as any).components,
  securitySchemes: {
    apiKey: {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
    },
  },
};

writeFileSync("openapi.json", JSON.stringify(document, null, 2));
console.log("Generated openapi.json");
