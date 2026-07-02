export type OffreCategorie = "Stage" | "PFE" | "Emploi";

export function classifyOfferType(typeContrat: string): OffreCategorie {
  const v = (typeContrat || "").toLowerCase();
  if (v.includes("pfe")) return "PFE";
  if (v.includes("stage")) return "Stage";
  return "Emploi";
}
