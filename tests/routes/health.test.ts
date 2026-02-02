import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import healthRoutes from "../../src/routes/health.js";

const app = express();
app.use(healthRoutes);

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      service: "lifecycle-emails-service",
    });
  });
});
