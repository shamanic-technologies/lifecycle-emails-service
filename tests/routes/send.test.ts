import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.hoisted(() => {
  process.env.POSTMARK_SERVICE_API_KEY = "test-api-key";
  process.env.LIFECYCLE_EMAILS_SERVICE_API_KEY = "test-service-key";
});

// Mock db to avoid needing a real database
vi.mock("../../src/db/index.js", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "fake-id" }]),
        }),
      }),
    }),
  },
}));

// Mock clerk to avoid external calls
vi.mock("../../src/lib/clerk.js", () => ({
  resolveUserEmail: vi.fn().mockResolvedValue("user@example.com"),
  resolveOrgEmails: vi.fn().mockResolvedValue(["user@example.com"]),
}));

import request from "supertest";
import express from "express";
import sendRoutes from "../../src/routes/send.js";

let fetchSpy: ReturnType<typeof vi.fn>;

const app = express();
app.use(express.json());
app.use(sendRoutes);

beforeEach(() => {
  fetchSpy = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /send", () => {
  it("passes orgId and runId to the Postmark service for user_active events", async () => {
    const res = await request(app)
      .post("/send")
      .set("X-API-Key", "test-service-key")
      .send({
        appId: "mcpfactory",
        eventType: "user_active",
        clerkUserId: "user_123",
        clerkOrgId: "org_456",
      });

    expect(res.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.orgId).toBe("org_456");
    expect(body.runId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
    expect(body.from).toBeDefined();
    expect(body.to).toBeDefined();
    expect(body.subject).toBeDefined();
  });

  it("sends orgId as null when clerkOrgId is not provided", async () => {
    const res = await request(app)
      .post("/send")
      .set("X-API-Key", "test-service-key")
      .send({
        appId: "mcpfactory",
        eventType: "user_active",
        clerkUserId: "user_789",
      });

    expect(res.status).toBe(200);

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.orgId).toBeNull();
    expect(body.runId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });
});
