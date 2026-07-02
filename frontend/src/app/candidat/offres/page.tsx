"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { matchingApi, offresApi, candidaturesApi } from "@/services/api";
import { getStoredUser } from "@/lib/auth";
import type { Offre, MatchingResult, Candidature } from "@/types";

export default function CandidatOffresPage() {
  const [rows, setRows] = useState<(MatchingResult & { offre?: Offre })[]>([]);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.id_laureat) return;

    Promise.all([
      matchingApi.topOffres(user.id_laureat, 50),
      offresApi.list({ limit: 300 }),
      candidaturesApi.mine(),
    ])
      .then(([matchesRes, offresRes, candidaturesRes]) => {
        const offresById: Record<string, Offre> = {};
        (offresRes.data as Offre[]).forEach((o) => (offresById[o.id_offre] = o));
        const merged = (matchesRes.data as MatchingResult[])
          .map((m) => ({ ...m, offre: offresById[m.id_offre] }))
          .filter((m) => m.offre);
        setRows(merged);
        setApplied(new Set((candidaturesRes.data as Candidature[]).map((c) => c.id_offre)));
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePostuler = async (id_offre: string) => {
    setBusy(id_offre);
    try {
      await candidaturesApi.postuler(id_offre);
      setApplied(new Set([...applied, id_offre]));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Offres qui vous correspondent</h1>
      <p className="text-gray-500 text-sm mb-6">Classées par score de compatibilité avec votre profil.</p>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-400">
          Aucune offre pour le moment. Complétez votre profil et vos compétences pour de meilleurs résultats.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id_offre} className="card flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-primary/10 text-primary">{r.offre?.type_contrat}</span>
                  <span className="text-xs font-bold text-cmc-teal-dark">{Math.round(r.score_final)}% — {r.decision}</span>
                </div>
                <Link href={`/offres/${r.id_offre}`} className="font-semibold text-gray-900 hover:underline">
                  {r.offre?.titre_poste}
                </Link>
                <p className="text-sm text-gray-500">{r.offre?.entreprise} · {r.offre?.localisation}</p>
              </div>
              {applied.has(r.id_offre) ? (
                <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold flex-shrink-0">
                  <CheckCircle2 size={16} /> Postulé
                </span>
              ) : (
                <button
                  onClick={() => handlePostuler(r.id_offre)}
                  disabled={busy === r.id_offre}
                  className="btn-primary flex-shrink-0"
                >
                  Postuler
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
