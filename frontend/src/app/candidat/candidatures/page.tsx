"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { candidaturesApi, offresApi } from "@/services/api";
import type { Candidature, Offre } from "@/types";

const STATUT_STYLES: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  vue: "bg-blue-100 text-blue-700",
  acceptee: "bg-emerald-100 text-emerald-700",
  rejetee: "bg-red-100 text-red-700",
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  vue: "Vue par l'entreprise",
  acceptee: "Acceptée",
  rejetee: "Rejetée",
};

export default function CandidatCandidaturesPage() {
  const [rows, setRows] = useState<(Candidature & { offre?: Offre })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([candidaturesApi.mine(), offresApi.list({ limit: 300 })]).then(([cRes, oRes]) => {
      const offresById: Record<string, Offre> = {};
      (oRes.data as Offre[]).forEach((o) => (offresById[o.id_offre] = o));
      setRows((cRes.data as Candidature[]).map((c) => ({ ...c, offre: offresById[c.id_offre] })));
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes candidatures</h1>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-400">Vous n&apos;avez pas encore postulé à une offre.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <div key={c.id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0">
                <Link href={`/offres/${c.id_offre}`} className="font-semibold text-gray-900 hover:underline">
                  {c.offre?.titre_poste ?? c.id_offre}
                </Link>
                <p className="text-sm text-gray-500">{c.offre?.entreprise}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Candidature envoyée le {new Date(c.applied_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {c.match_score !== null && (
                  <p className="text-xs font-bold text-cmc-teal-dark mb-1">{Math.round(c.match_score)}% compatible</p>
                )}
                <span className={`badge ${STATUT_STYLES[c.statut] || "bg-gray-100 text-gray-600"}`}>
                  {STATUT_LABELS[c.statut] || c.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
