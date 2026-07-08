export function extractErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return "Une erreur est survenue.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => e?.msg || JSON.stringify(e))
      .join(" ");
  }
  return "Une erreur est survenue.";
}
