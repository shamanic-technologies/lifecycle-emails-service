import { describe, it, expect, vi } from "vitest";

// Mock db so the template index module can import without a real database
vi.mock("../../src/db/index.js", () => ({
  db: {},
}));

import { interpolate } from "../../src/templates/index.js";

describe("interpolate", () => {
  it("replaces {{variable}} with metadata values", () => {
    const result = interpolate("Hello {{name}}, welcome to {{app}}!", {
      name: "Alice",
      app: "MyApp",
    });
    expect(result).toBe("Hello Alice, welcome to MyApp!");
  });

  it("replaces unknown variables with empty string", () => {
    const result = interpolate("Hello {{name}}!", {});
    expect(result).toBe("Hello !");
  });

  it("handles missing metadata", () => {
    const result = interpolate("Hello {{name}}!");
    expect(result).toBe("Hello !");
  });

  it("leaves text without placeholders unchanged", () => {
    const result = interpolate("No variables here", { name: "Alice" });
    expect(result).toBe("No variables here");
  });

  it("converts non-string metadata values to strings", () => {
    const result = interpolate("Count: {{count}}, Active: {{active}}", {
      count: 42,
      active: true,
    });
    expect(result).toBe("Count: 42, Active: true");
  });

  it("handles null/undefined metadata values as empty string", () => {
    const result = interpolate("Value: {{val}}", { val: null });
    expect(result).toBe("Value: ");
  });
});
