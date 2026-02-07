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
  definitions: {
    SendRequest: {
      appId: "mcpfactory",
      eventType: "welcome",
      clerkUserId: "user_abc123",
      clerkOrgId: "org_xyz789",
      recipientEmail: "user@example.com",
      metadata: { name: "Alice" },
    },
    SendResponse: {
      results: [
        {
          email: "user@example.com",
          sent: true,
          reason: "duplicate",
        },
      ],
    },
    HealthResponse: {
      status: "ok",
      service: "lifecycle-emails-service",
    },
    ErrorResponse: {
      error: "Error message",
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
