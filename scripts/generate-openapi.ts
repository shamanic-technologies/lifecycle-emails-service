import swaggerAutogen from "swagger-autogen";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const doc = {
  info: {
    title: "Lifecycle Emails Service",
    description: "Send lifecycle and transactional emails with deduplication, template rendering, and delivery tracking.",
    version: "0.1.0",
  },
  host: "localhost:3008",
  schemes: ["https"],
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

swaggerAutogen()(outputFile, routes, doc).then(() => {
  console.log("OpenAPI spec generated at openapi.json");
});
