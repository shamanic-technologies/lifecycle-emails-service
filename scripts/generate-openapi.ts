import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "../src/schemas";
import { writeFileSync } from "fs";

const generator = new OpenApiGeneratorV3(registry.definitions);

const document = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Transactional Email Service",
    description: "Transactional email service with templating, deduplication, and recipient resolution",
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
