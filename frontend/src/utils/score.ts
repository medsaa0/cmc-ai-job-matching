export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-700 bg-green-100";
  if (score >= 65) return "text-blue-700 bg-blue-100";
  if (score >= 50) return "text-orange-700 bg-orange-100";
  return "text-red-700 bg-red-100";
}

export function getDecisionColor(decision: string): string {
  const d = decision?.toLowerCase() || "";
  if (d.includes("très") || d.includes("tres")) return "text-green-700 bg-green-100";
  if (d.includes("recommandé") || d.includes("recommande")) return "text-blue-700 bg-blue-100";
  if (d.includes("moyen")) return "text-orange-700 bg-orange-100";
  return "text-red-700 bg-red-100";
}
