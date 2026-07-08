"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { getDecisionColor } from "@/utils/score";

interface CandidatureDetail {
  candidature_id: number;
  statut: string;
  applied_at: string | null;
  id_laureat: string;
  nom: string | null;
  prenom: string | null;
  score_final: number | null;
  decision: string | null;
}

interface OffreDetail {
  offre: {
    id_offre: string;
    titre_poste: string;
    entreprise: string;
    domaine: string;
    localisation: string;
    statut_offre: string;
  };
  nb_candidatures: number;
  score_moyen: number | null;
  candidatures: CandidatureDetail[];
}

export default function AdminOffreDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [detail, setDetail] = useState<OffreDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.offreDetail(id).then((r) => setDetail(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10 text-blue-700">Chargement...</div>;
  if (!detail) return <div className="text-center py-10 text-gray-400">Offre introuvable.</div>;

  return (
    <div className="space-y-5">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-blue-700 hover:underline w-fit">
        <ArrowLeft size={14} /> Retour au tableau de bord
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{detail.offre.titre_poste}</h1>
        <p className="text-gray-500 text-sm">
          {detail.offre.entreprise} · {detail.offre.localisation} · {detail.offre.domaine}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card"><p className="text-xs text-gray-500">Statut</p><p className="text-lg font-bold">{detail.offre.statut_offre}</p></div>
        <div className="card"><p className="text-xs text-gray-500">Candidatures</p><p className="text-lg font-bold">{detail.nb_candidatures}</p></div>
        <div className="card"><p className="text-xs text-gray-500">Score moyen</p><p className="text-lg font-bold">{detail.score_moyen !== null ? `${Math.round(detail.score_moyen)}%` : "—"}</p></div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Candidat</th>
              <th className="text-left px-4 py-2">Score</th>
              <th className="text-left px-4 py-2">Décision</th>
              <th className="text-left px-4 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {detail.candidatures.map((c) => (
              <tr key={c.candidature_id} className="border-t border-gray-100">
                <td className="px-4 py-2">
                  <Link href={`/admin/laureats/${c.id_laureat}/detail`} className="text-blue-700 hover:underline">
                    {c.prenom} {c.nom}
                  </Link>
                  <span className="text-gray-400 text-xs ml-2">{c.id_laureat}</span>
                </td>
                <td className="px-4 py-2 font-bold text-cmc-teal-dark">
                  {c.score_final !== null ? `${Math.round(c.score_final)}%` : "—"}
                </td>
                <td className="px-4 py-2">
                  {c.decision ? <span className={`badge ${getDecisionColor(c.decision)}`}>{c.decision}</span> : "—"}
                </td>
                <td className="px-4 py-2 text-gray-600">{c.statut}</td>
              </tr>
            ))}
            {detail.candidatures.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Aucune candidature.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
