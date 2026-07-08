"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { getDecisionColor } from "@/utils/score";

interface LaureatDetail {
  laureat: {
    id_laureat: string;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    filiere: string | null;
    niveau_formation: string | null;
    localisation: string | null;
    statut_profil: string | null;
  };
  candidatures: { id_offre: string; statut: string; match_score: number | null; applied_at: string | null }[];
  top_matchings: { id_offre: string; score_final: number; decision: string }[];
}

export default function AdminLaureatDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [detail, setDetail] = useState<LaureatDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.laureatDetail(id).then((r) => setDetail(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10 text-blue-700">Chargement...</div>;
  if (!detail) return <div className="text-center py-10 text-gray-400">Lauréat introuvable.</div>;

  const { laureat } = detail;

  return (
    <div className="space-y-5">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-blue-700 hover:underline w-fit">
        <ArrowLeft size={14} /> Retour au tableau de bord
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{laureat.prenom} {laureat.nom}</h1>
        <p className="text-gray-500 text-sm">
          {laureat.id_laureat} · {laureat.filiere} · {laureat.localisation}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Candidatures ({detail.candidatures.length})</h2>
          <div className="space-y-2">
            {detail.candidatures.map((c) => (
              <div key={c.id_offre} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-700">{c.id_offre}</span>
                <span className="text-gray-500">{c.statut}</span>
                <span className="font-bold text-cmc-teal-dark">{c.match_score !== null ? `${Math.round(c.match_score)}%` : "—"}</span>
              </div>
            ))}
            {detail.candidatures.length === 0 && <p className="text-gray-400 text-sm">Aucune candidature.</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Meilleurs matchings</h2>
          <div className="space-y-2">
            {detail.top_matchings.map((m) => (
              <div key={m.id_offre} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-700">{m.id_offre}</span>
                <span className={`badge ${getDecisionColor(m.decision)}`}>{m.decision}</span>
                <span className="font-bold text-cmc-teal-dark">{Math.round(m.score_final)}%</span>
              </div>
            ))}
            {detail.top_matchings.length === 0 && <p className="text-gray-400 text-sm">Aucun matching.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
