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

// Mock runs-client to avoid external calls
vi.mock("../../src/lib/runs-client.js", () => ({
  ensureOrganization: vi.fn().mockResolvedValue("runs-org-123"),
  createRun: vi.fn().mockResolvedValue({ id: "run-456" }),
  updateRun: vi.fn().mockResolvedValue({}),
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
  it("creates a run and passes real runId to Postmark service", async () => {
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
    expect(body.runId).toBe("run-456"); // Real run ID from runs-service
    expect(body.from).toBeDefined();
    expect(body.to).toBeDefined();
    expect(body.subject).toBeDefined();
  });

  it("uses system org when clerkOrgId is not provided", async () => {
    const { ensureOrganization } = await import("../../src/lib/runs-client.js");

    const res = await request(app)
      .post("/send")
      .set("X-API-Key", "test-service-key")
      .send({
        appId: "mcpfactory",
        eventType: "user_active",
        clerkUserId: "user_789",
      });

    expect(res.status).toBe(200);

    // Should use system org ID when no clerkOrgId provided
    expect(ensureOrganization).toHaveBeenCalledWith("lifecycle-emails-service");

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.orgId).toBeNull();
    expect(body.runId).toBe("run-456");
  });
});
