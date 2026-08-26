/** SORNDI score utilities keep missing and excused records distinct from recorded zero values. */
export type ScoreValue = { value: number | null; status: "recorded" | "missing" | "excused" };

export function calculateAssessmentMean(scores: ScoreValue[]): number | null {
  const recorded = scores.filter((score) => score.status === "recorded" && score.value !== null);
  if (!recorded.length) return null;
  return recorded.reduce((total, score) => total + Number(score.value), 0) / recorded.length;
}

export function calculateWeightedPercent(
  assessments: Array<{ maximumScore: number; weight: number; scores: ScoreValue[] }>,
): number | null {
  let total = 0;
  let totalWeight = 0;
  for (const assessment of assessments) {
    const mean = calculateAssessmentMean(assessment.scores);
    if (mean === null || assessment.maximumScore <= 0 || assessment.weight <= 0) continue;
    total += (mean / assessment.maximumScore) * assessment.weight;
    totalWeight += assessment.weight;
  }
  return totalWeight ? (total / totalWeight) * 100 : null;
}
