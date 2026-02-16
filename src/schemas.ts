import { z } from "zod";
import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// --- POST /send ---

export const SendRequestSchema = z
  .object({
    appId: z.string().openapi({ description: "App identifier. Must match the appId used when deploying templates via PUT /templates." }),
    eventType: z.string().openapi({ description: "Event type. Must match a template name registered via PUT /templates (or a hardcoded template)." }),
    brandId: z.string().optional(),
    campaignId: z.string().optional(),
    productId: z.string().optional().openapi({ description: "Product/instance ID for product-scoped dedup (e.g. webinar ID). Required for webinar events." }),
    clerkUserId: z.string().optional().openapi({ description: "Clerk user ID — resolves to their email address." }),
    clerkOrgId: z.string().optional().openapi({ description: "Clerk org ID — sends to all org members." }),
    recipientEmail: z.string().email().optional().openapi({ description: "Direct email address (fallback if no Clerk IDs)." }),
    metadata: z.record(z.string(), z.unknown()).optional().openapi({ description: "Template-specific data. Keys are interpolated into {{variable}} placeholders in the template." }),
  })
  .openapi("SendRequest");

export type SendRequest = z.infer<typeof SendRequestSchema>;

export const SendResultSchema = z
  .object({
    email: z.string(),
    sent: z.boolean(),
    reason: z.string().optional(),
  })
  .openapi("SendResult");

export const SendResponseSchema = z
  .object({
    results: z.array(SendResultSchema),
  })
  .openapi("SendResponse");

export type SendResponse = z.infer<typeof SendResponseSchema>;

// --- Health ---

export const HealthResponseSchema = z
  .object({
    status: z.string(),
    service: z.string(),
  })
  .openapi("HealthResponse");

// --- Error ---

export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    details: z.unknown().optional(),
  })
  .openapi("ErrorResponse");

// --- POST /stats ---

export const StatsRequestSchema = z
  .object({
    appId: z.string().optional(),
    clerkOrgId: z.string().optional(),
    clerkUserId: z.string().optional(),
    eventType: z.string().optional(),
  })
  .openapi("StatsRequest");

export type StatsRequest = z.infer<typeof StatsRequestSchema>;

export const StatsResponseSchema = z
  .object({
    stats: z.object({
      totalEmails: z.number(),
      sent: z.number(),
      failed: z.number(),
    }),
  })
  .openapi("StatsResponse");

// --- PUT /templates ---

export const TemplateItemSchema = z
  .object({
    name: z.string().min(1).openapi({ description: "Template name. Used as the eventType when calling POST /send. Must be unique within the appId.", example: "welcome" }),
    subject: z.string().min(1).openapi({ description: "Email subject line. Supports {{variable}} interpolation from metadata.", example: "Welcome to {{appName}}!" }),
    htmlBody: z.string().min(1).openapi({ description: "HTML email body. Supports {{variable}} interpolation from metadata.", example: "<h1>Welcome {{name}}!</h1>" }),
    textBody: z.string().optional().default("").openapi({ description: "Plain text email body (optional). Supports {{variable}} interpolation from metadata." }),
  })
  .openapi("TemplateItem");

export const DeployTemplatesRequestSchema = z
  .object({
    appId: z.string().min(1).openapi({ description: "Your application identifier. Templates are scoped to (appId + name). Use the same appId when sending emails via POST /send.", example: "my-app" }),
    templates: z.array(TemplateItemSchema).min(1).openapi({ description: "The templates to deploy. Existing templates with the same name are updated." }),
  })
  .openapi("DeployTemplatesRequest");

export type DeployTemplatesRequest = z.infer<typeof DeployTemplatesRequestSchema>;

export const DeployTemplateResultSchema = z
  .object({
    name: z.string(),
    action: z.enum(["created", "updated"]),
  })
  .openapi("DeployTemplateResult");

export const DeployTemplatesResponseSchema = z
  .object({
    templates: z.array(DeployTemplateResultSchema),
  })
  .openapi("DeployTemplatesResponse");

// --- Register endpoints ---

registry.registerPath({
  method: "get",
  path: "/health",
  summary: "Health check",
  description: "Returns service health status",
  tags: ["Health"],
  responses: {
    200: {
      description: "Service is healthy",
      content: { "application/json": { schema: HealthResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/send",
  summary: "Send a transactional email",
  description:
    "Send a transactional email using a previously registered template (via PUT /templates). Resolves recipients via Clerk user/org IDs or direct email. Metadata keys are interpolated into {{variable}} placeholders in the template. Dedup strategy depends on the event type.",
  tags: ["Email"],
  security: [{ apiKey: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: SendRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Email send results",
      content: { "application/json": { schema: SendResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Unauthorized - invalid or missing API key",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/stats",
  summary: "Get aggregated stats",
  description:
    "Get aggregated email event stats filtered by appId, clerkOrgId, clerkUserId, and/or eventType. At least one filter required.",
  tags: ["Stats"],
  security: [{ apiKey: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: StatsRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Aggregated stats",
      content: { "application/json": { schema: StatsResponseSchema } },
    },
    400: {
      description: "Validation error or missing filters",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Unauthorized - invalid or missing API key",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/templates",
  summary: "Deploy (upsert) email templates",
  description:
    "Idempotent: creates new templates or updates existing ones matched by (appId + name). Call this at app startup to register all your email templates. After deploying, send emails via POST /send with the same appId and eventType matching the template name. Templates support {{variable}} interpolation — metadata keys passed at send time replace matching {{key}} placeholders in subject, htmlBody, and textBody.",
  tags: ["Templates"],
  security: [{ apiKey: [] }],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: DeployTemplatesRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Templates deployed",
      content: { "application/json": { schema: DeployTemplatesResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
    401: {
      description: "Unauthorized - invalid or missing API key",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/openapi.json",
  summary: "OpenAPI specification",
  description: "Returns the OpenAPI spec for this service",
  tags: ["Docs"],
  responses: {
    200: { description: "OpenAPI JSON document" },
    404: {
      description: "Spec not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});
