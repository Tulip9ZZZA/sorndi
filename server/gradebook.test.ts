import { describe, expect, it } from "vitest";
import { calculateAssessmentMean, calculateWeightedPercent } from "./gradebook";

describe("SORNDI gradebook calculations", () => {
  it("excludes missing and excused records instead of treating them as zero", () => {
    expect(calculateAssessmentMean([
      { value: 8, status: "recorded" },
      { value: null, status: "missing" },
      { value: null, status: "excused" },
    ])).toBe(8);
  });

  it("weights available assessment means transparently", () => {
    expect(calculateWeightedPercent([
      { maximumScore: 10, weight: 1, scores: [{ value: 8, status: "recorded" }] },
      { maximumScore: 20, weight: 2, scores: [{ value: 14, status: "recorded" }] },
    ])).toBeCloseTo(73.333, 2);
  });
});
