"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Download, Linkedin, Github, Mail, Phone } from "lucide-react";
import { candidaturesApi, offresApi, exportApi } from "@/services/api";
import { getDecisionColor } from "@/utils/score";
import type { CandidatureEnrichie, CandidatureOffreStats, Offre } from "@/types";

const STATUTS = ["en_attente", "vue", "acceptee", "rejetee"];
const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  vue: "En cours",
  acceptee: "Accepté",
  rejetee: "Rejeté",
};
const STATUT_COLORS: Record<string, string> = {
  en_attente: "bg-gray-100 text-gray-600",
  vue: "bg-blue-100 text-blue-700",
  acceptee: "bg-emerald-100 text-emerald-700",
  rejetee: "bg-red-100 text-red-700",
};
const DECISIONS = ["Très recommandé", "Recommandé", "Moyen", "Non prioritaire"];

export default function OffreCandidatsPage() {
  const params = useParams();
  const id = params.id as string;
  const [offre, setOffre] = useState<Offre | null>(null);
  const [rows, setRows] = useState<CandidatureEnrichie[]>([]);
  const [stats, setStats] = useState<CandidatureOffreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [statutFilter, setStatutFilter] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("");
  const [scoreMinFilter, setScoreMinFilter] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (statutFilter) filters.statut = statutFilter;
    if (decisionFilter) filters.decision = decisionFilter;
    if (scoreMinFilter) filters.score_min = scoreMinFilter;

    Promise.all([
      offresApi.get(id),
      candidaturesApi.forOffre(id, filters),
      candidaturesApi.statsForOffre(id),
    ])
      .then(([oRes, cRes, sRes]) => {
        setOffre(oRes.data);
        setRows(cRes.data);
        setStats(sRes.data);
      })
      .finally(() => setLoading(false));
  }, [id, statutFilter, decisionFilter, scoreMinFilter]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportApi.matchingOffre(id);
    } finally {
      setExporting(false);
    }
  };

  const handleStatutChange = async (candidatureId: number, statut: string) => {
    setBusyId(candidatureId);
    try {
      await candidaturesApi.updateStatut(candidatureId, statut);
      setRows((prev) => prev.map((r) => (r.candidature_id === candidatureId ? { ...r, statut } : r)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Candidats pour cette offre</h1>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> {exporting ? "Export..." : "Exporter en CSV"}
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-4">{offre?.titre_poste}</p>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="card py-3">
            <p className="text-xs text-gray-500">Candidatures</p>
            <p className="text-xl font-bold text-gray-900">{stats.nb_candidatures_total}</p>
          </div>
          <div className="card py-3">
            <p className="text-xs text-gray-500">Score moyen</p>
            <p className="text-xl font-bold text-gray-900">
              {stats.score_moyen !== null ? `${Math.round(stats.score_moyen)}%` : "—"}
            </p>
          </div>
          <div className="card py-3">
            <p className="text-xs text-gray-500">En attente</p>
            <p className="text-xl font-bold text-gray-900">{stats.par_statut["en_attente"] || 0}</p>
          </div>
          <div className="card py-3">
            <p className="text-xs text-gray-500">Acceptés</p>
            <p className="text-xl font-bold text-gray-900">{stats.par_statut["acceptee"] || 0}</p>
          </div>
        </div>
      )}

      <div className="card flex flex-wrap gap-3 mb-4">
        <select className="input w-44" value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>
        <select className="input w-52" value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value)}>
          <option value="">Toutes décisions</option>
          {DECISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input
          type="number"
          min={0}
          max={100}
          placeholder="Score min (%)"
          className="input w-36"
          value={scoreMinFilter}
          onChange={(e) => setScoreMinFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-400">Aucun candidat ne correspond à ces filtres pour le moment.</p>
      ) : (
        <div className="card p-0 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Candidat</th>
                <th className="text-left px-4 py-3">Filière</th>
                <th className="text-left px-4 py-3">Compétences</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Décision</th>
                <th className="text-left px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.candidature_id} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.prenom} {r.nom}</p>
                    <p className="text-xs text-gray-400">{r.id_laureat} · {r.localisation || "—"}</p>
                    <div className="flex items-center gap-2 mt-1 text-gray-400">
                      {r.email && <Mail size={13} />}
                      {r.telephone && <Phone size={13} />}
                      {r.linkedin && <Linkedin size={13} />}
                      {r.github_portfolio && <Github size={13} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{r.filiere || "—"}</p>
                    <p className="text-xs text-gray-400">{r.niveau_formation}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {r.competences_communes.slice(0, 4).map((c) => (
                        <span key={c} className="badge bg-green-100 text-green-700 text-xs">{c}</span>
                      ))}
                      {r.competences_manquantes.slice(0, 3).map((c) => (
                        <span key={c} className="badge bg-red-100 text-red-700 text-xs line-through">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-cmc-teal-dark">
                    {r.score_final !== null ? `${Math.round(r.score_final)}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {r.decision ? (
                      <span className={`badge ${getDecisionColor(r.decision)}`}>{r.decision}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={`input text-xs py-1 ${STATUT_COLORS[r.statut] || ""}`}
                      value={r.statut}
                      disabled={busyId === r.candidature_id}
                      onChange={(e) => handleStatutChange(r.candidature_id, e.target.value)}
                    >
                      {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
