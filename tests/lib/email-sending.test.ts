import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.hoisted(() => {
  process.env.EMAIL_SENDING_SERVICE_API_KEY = "test-api-key";
});

import { sendEmail } from "../../src/lib/email-sending.js";

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendEmail", () => {
  it("sends a transactional email via the email-sending service", async () => {
    await sendEmail({
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
    const [url, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(url).toContain("/send");
    expect(body).toMatchObject({
      type: "transactional",
      to: "test@example.com",
      subject: "Test subject",
      clerkOrgId: "org_123",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "brand_123",
      campaignId: "campaign_456",
      htmlBody: "<p>Test</p>",
      textBody: "Test",
      tag: "mcpfactory-user_active",
      recipientFirstName: "",
      recipientLastName: "",
      recipientCompany: "",
    });
  });

  it("maps orgId to clerkOrgId in the payload", async () => {
    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      htmlBody: "<p>Test</p>",
      textBody: "Test",
      tag: "test-tag",
      orgId: "org_real_123",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "lifecycle",
      campaignId: "lifecycle-test",
    });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.clerkOrgId).toBe("org_real_123");
    expect(body.runId).toBe("run_abc");
  });

  it("omits clerkOrgId from payload when orgId is undefined", async () => {
    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      htmlBody: "<p>Test</p>",
      textBody: "Test",
      tag: "test-tag",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "lifecycle",
      campaignId: "lifecycle-test",
    });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.clerkOrgId).toBeUndefined();
    expect(body.runId).toBe("run_abc");
  });

  it("includes all required fields for email-sending service", async () => {
    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      htmlBody: "<p>Test</p>",
      textBody: "Test",
      tag: "test-tag",
      orgId: "org_xyz",
      runId: "run_abc",
      appId: "mcpfactory",
      brandId: "brand_xyz",
      campaignId: "campaign_789",
    });

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body.type).toBe("transactional");
    expect(body.appId).toBe("mcpfactory");
    expect(body.brandId).toBe("brand_xyz");
    expect(body.campaignId).toBe("campaign_789");
    expect(body.recipientFirstName).toBe("");
    expect(body.recipientLastName).toBe("");
    expect(body.recipientCompany).toBe("");
  });
});
