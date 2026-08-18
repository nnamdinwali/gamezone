import { describe, expect, it } from "vitest";
import { appendIntelligenceExchange, canSendIntelligenceMessage, isOwnerOnlyObservationMode } from "./intelligence";

describe("Rockcity Intelligence safety contract", () => {
  it("accepts owner-only observation mode", () => {
    expect(isOwnerOnlyObservationMode({ ownerOnly: true, automaticRestrictions: false })).toBe(true);
  });

  it("rejects a response that enables automatic restrictions", () => {
    expect(isOwnerOnlyObservationMode({ ownerOnly: true, automaticRestrictions: true })).toBe(false);
  });

  it("does not show observation mode before a response exists", () => {
    expect(isOwnerOnlyObservationMode(null)).toBe(false);
  });

  it("only enables sending a valid question in an active conversation", () => {
    expect(canSendIntelligenceMessage("  ", 1, false)).toBe(false);
    expect(canSendIntelligenceMessage("Review activity", null, false)).toBe(false);
    expect(canSendIntelligenceMessage("Review activity", 1, true)).toBe(false);
    expect(canSendIntelligenceMessage("Review activity", 1, false)).toBe(true);
  });

  it("keeps the user question before the assistant answer", () => {
    const exchange = appendIntelligenceExchange([], "Review activity", "Here is the review.", (role, content) => ({ role, content }));
    expect(exchange).toEqual([
      { role: "user", content: "Review activity" },
      { role: "assistant", content: "Here is the review." },
    ]);
  });
});
