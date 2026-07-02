import Link from "next/link";
import { Clock, MapPin, Briefcase } from "lucide-react";
import type { Offre } from "@/types";
import { classifyOfferType } from "@/lib/offerType";

const TYPE_STYLES: Record<string, { border: string; badgeBg: string; badgeText: string }> = {
  Stage: { border: "border-t-blue-500", badgeBg: "bg-blue-50", badgeText: "text-blue-600" },
  PFE: { border: "border-t-cmc-crimson", badgeBg: "bg-red-50", badgeText: "text-cmc-crimson" },
  Emploi: { border: "border-t-emerald-500", badgeBg: "bg-emerald-50", badgeText: "text-emerald-600" },
};

function styleFor(type: string) {
  const category = classifyOfferType(type);
  return { ...TYPE_STYLES[category], label: category };
}

function daysLeft(datePublication: string): number | null {
  if (!datePublication) return null;
  const published = new Date(datePublication);
  const deadline = new Date(published);
  deadline.setDate(deadline.getDate() + 60);
  const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

export default function OffreCard({ offre, matchScore }: { offre: Offre; matchScore?: number }) {
  const s = styleFor(offre.type_contrat);
  const remaining = daysLeft(offre.date_publication);

  return (
    <Link
      href={`/offres/${offre.id_offre}`}
      className={`block bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${s.border} p-5 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`badge ${s.badgeBg} ${s.badgeText}`}>{s.label}</span>
        {remaining !== null && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} /> {remaining} jours restants
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="w-8 h-8 rounded-lg bg-cmc-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {offre.entreprise?.[0]?.toUpperCase() ?? "?"}
        </span>
        <span className="text-sm text-gray-600 truncate">{offre.entreprise}</span>
      </div>

      <h3 className="font-bold text-gray-900 mb-3 leading-snug">{offre.titre_poste}</h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {offre.domaine && <span className="badge bg-gray-100 text-gray-600">{offre.domaine}</span>}
        {offre.localisation && (
          <span className="badge bg-gray-100 text-gray-600 flex items-center gap-1">
            <MapPin size={11} /> {offre.localisation}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="pill flex items-center gap-1">
          <Briefcase size={12} /> Poste(s) disponible(s)
        </span>
        {matchScore !== undefined && (
          <span className="text-xs font-bold text-cmc-teal-dark">{Math.round(matchScore)}% compatible</span>
        )}
      </div>
    </Link>
  );
}
