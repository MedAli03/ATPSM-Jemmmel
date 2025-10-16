import { describe, expect, it } from "vitest";
import { sanitizeMessagesForRole } from "../sanitizeMessages";

describe("sanitizeMessagesForRole", () => {
  it("filters AI system messages for parents", () => {
    const messages = [
      { id: "1", kind: "system", metadata: { source: "ai" } },
      { id: "2", kind: "text" },
    ];
    const filtered = sanitizeMessagesForRole(messages, "PARENT");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
  });
});
