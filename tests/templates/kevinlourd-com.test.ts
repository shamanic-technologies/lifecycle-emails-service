import { describe, it, expect } from "vitest";
import { getTemplate } from "../../src/templates/index.js";

describe("kevinlourd-com templates", () => {
  it("has a welcome template registered", () => {
    const templateFn = getTemplate("kevinlourd-com", "welcome");
    expect(templateFn).toBeTypeOf("function");
  });

  it("welcome template returns subject, htmlBody, textBody", () => {
    const templateFn = getTemplate("kevinlourd-com", "welcome");
    const result = templateFn();

    expect(result.subject).toBe("Welcome to kevinlourd.com!");
    expect(result.htmlBody).toContain("Welcome!");
    expect(result.htmlBody).toContain("https://kevinlourd.com");
    expect(result.textBody).toContain("Welcome!");
    expect(result.textBody).toContain("https://kevinlourd.com");
  });

  it("throws for unknown event type", () => {
    expect(() => getTemplate("kevinlourd-com", "nonexistent")).toThrow(
      "No template for event 'nonexistent' in app 'kevinlourd-com'"
    );
  });
});
