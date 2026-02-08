import swaggerAutogen from "swagger-autogen";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const doc = {
  info: {
    title: "Lifecycle Emails Service",
    description: "Transactional and lifecycle email service",
    version: "1.0.0",
  },
  servers: [
    { url: process.env.SERVICE_URL || "http://localhost:3000" },
  ],
  securityDefinitions: {
    apiKey: {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
    },
  },
  "@definitions": {
    SendRequest: {
      type: "object",
      required: ["appId", "eventType"],
      properties: {
        appId: { type: "string", example: "mcpfactory" },
        eventType: { type: "string", example: "welcome" },
        brandId: { type: "string", example: "brand_abc123" },
        campaignId: { type: "string", example: "campaign_xyz789" },
        clerkUserId: { type: "string", example: "user_abc123" },
        clerkOrgId: { type: "string", example: "org_xyz789" },
        recipientEmail: { type: "string", example: "user@example.com" },
        metadata: { type: "object", example: { name: "Alice" } },
      },
    },
    SendResponse: {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              email: { type: "string", example: "user@example.com" },
              sent: { type: "boolean", example: true },
              reason: { type: "string", example: "duplicate" },
            },
          },
        },
      },
    },
    HealthResponse: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        service: { type: "string", example: "lifecycle-emails-service" },
      },
    },
    ErrorResponse: {
      type: "object",
      properties: {
        error: { type: "string", example: "Error message" },
        receivedKeys: {
          type: "array",
          items: { type: "string" },
          description: "Keys found in request body (debug info)",
        },
      },
    },
  },
};

const outputFile = join(rootDir, "openapi.json");
const routes = [
  join(rootDir, "src/routes/health.ts"),
  join(rootDir, "src/routes/send.ts"),
];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc).then(() => {
  console.log("OpenAPI spec generated at openapi.json");
});
