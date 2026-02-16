import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInsertValues, mockUpdateSet, mockUpdateWhere, mockSelectLimit } = vi.hoisted(() => {
  process.env.TRANSACTIONAL_EMAIL_SERVICE_API_KEY = "test-service-key";

  const mockInsertValues = vi.fn().mockResolvedValue(undefined);
  const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
  const mockUpdateSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
  const mockSelectLimit = vi.fn().mockResolvedValue([]);

  return { mockInsertValues, mockUpdateSet, mockUpdateWhere, mockSelectLimit };
});

vi.mock("../../src/db/index.js", () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: mockInsertValues,
    }),
    update: vi.fn().mockReturnValue({
      set: mockUpdateSet,
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: mockSelectLimit,
        }),
      }),
    }),
  },
}));

import request from "supertest";
import express from "express";
import templatesRoutes from "../../src/routes/templates.js";

const app = express();
app.use(express.json());
app.use(templatesRoutes);

beforeEach(() => {
  vi.clearAllMocks();
  mockSelectLimit.mockResolvedValue([]);
  mockInsertValues.mockResolvedValue(undefined);
  mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
  mockUpdateWhere.mockResolvedValue(undefined);
});

describe("PUT /templates", () => {
  it("creates new templates when none exist", async () => {
    const res = await request(app)
      .put("/templates")
      .set("X-API-Key", "test-service-key")
      .send({
        appId: "my-app",
        templates: [
          {
            name: "welcome",
            subject: "Welcome!",
            htmlBody: "<h1>Welcome</h1>",
            textBody: "Welcome",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.templates).toEqual([{ name: "welcome", action: "created" }]);
    expect(mockInsertValues).toHaveBeenCalledOnce();
  });

  it("updates existing templates", async () => {
    mockSelectLimit.mockResolvedValue([{ id: "existing-id" }]);

    const res = await request(app)
      .put("/templates")
      .set("X-API-Key", "test-service-key")
      .send({
        appId: "my-app",
        templates: [
          {
            name: "welcome",
            subject: "Updated welcome!",
            htmlBody: "<h1>Updated</h1>",
            textBody: "Updated",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.templates).toEqual([{ name: "welcome", action: "updated" }]);
    expect(mockUpdateSet).toHaveBeenCalledOnce();
  });

  it("handles multiple templates in one request", async () => {
    const res = await request(app)
      .put("/templates")
      .set("X-API-Key", "test-service-key")
      .send({
        appId: "my-app",
        templates: [
          { name: "welcome", subject: "Welcome!", htmlBody: "<h1>Hi</h1>" },
          { name: "reset", subject: "Reset", htmlBody: "<h1>Reset</h1>" },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.templates).toHaveLength(2);
    expect(res.body.templates[0]).toEqual({ name: "welcome", action: "created" });
    expect(res.body.templates[1]).toEqual({ name: "reset", action: "created" });
  });

  it("returns 400 for missing appId", async () => {
    const res = await request(app)
      .put("/templates")
      .set("X-API-Key", "test-service-key")
      .send({
        templates: [{ name: "welcome", subject: "Hi", htmlBody: "<h1>Hi</h1>" }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid request");
  });

  it("returns 400 for empty templates array", async () => {
    const res = await request(app)
      .put("/templates")
      .set("X-API-Key", "test-service-key")
      .send({
        appId: "my-app",
        templates: [],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid request");
  });

  it("returns 401 without API key", async () => {
    const res = await request(app)
      .put("/templates")
      .send({
        appId: "my-app",
        templates: [{ name: "welcome", subject: "Hi", htmlBody: "<h1>Hi</h1>" }],
      });

    expect(res.status).toBe(401);
  });
});
