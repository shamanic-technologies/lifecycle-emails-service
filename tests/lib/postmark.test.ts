import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.hoisted(() => {
  process.env.POSTMARK_SERVICE_API_KEY = "test-api-key";
});

import { sendViaPostmark } from "../../src/lib/postmark.js";

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendViaPostmark", () => {
  it("includes orgId and runId in the Postmark payload", async () => {
    await sendViaPostmark({
      to: "test@example.com",
      subject: "Test subject",
      htmlBody: "<p>Test</p>",
      textBody: "Test",
      tag: "mcpfactory-user_active",
      orgId: "org_123",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "brand_123",
      campaignId: "campaign_456",
    });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toMatchObject({
      from: expect.any(String),
      to: "test@example.com",
      subject: "Test subject",
      orgId: "org_123",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "brand_123",
      campaignId: "campaign_456",
    });
  });

  it("sends orgId as the provided string value", async () => {
    await sendViaPostmark({
      to: "test@example.com",
      subject: "Test",
      htmlBody: "<p>Test</p>",
      textBody: "Test",
      tag: "test-tag",
      orgId: "lifecycle-emails-service",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "lifecycle",
      campaignId: "lifecycle-test",
    });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.orgId).toBe("lifecycle-emails-service");
    expect(body.runId).toBe("run_abc");
  });

  it("includes appId, brandId, and campaignId in the Postmark payload", async () => {
    await sendViaPostmark({
      to: "test@example.com",
      subject: "Test",
      htmlBody: "<p>Test</p>",
      textBody: "Test",
      tag: "test-tag",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "brand_xyz",
      campaignId: "campaign_789",
    });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.appId).toBe("mcpfactory");
    expect(body.brandId).toBe("brand_xyz");
    expect(body.campaignId).toBe("campaign_789");
  });
});
