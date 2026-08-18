import { describe, expect, it } from "vitest";
import { isOwnerOnlyObservationMode } from "./intelligence";

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
});
