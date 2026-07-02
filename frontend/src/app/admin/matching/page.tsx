"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { matchingApi } from "@/services/api";
import { MatchingResult } from "@/types";
import { GitMerge, Play, RefreshCw } from "lucide-react";
import { getScoreColor, getDecisionColor } from "@/utils/score";

const DECISIONS = ["", "Très recommandé", "Recommandé", "Moyen", "Non prioritaire"];

export default function MatchingPage() {
  const router = useRouter();
  const [results, setResults] = useState<MatchingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [decision, setDecision] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    load();
  }, []);

  const load = () => {
    setLoading(true);
    matchingApi.results({ decision: decision || undefined, limit: 300 })
      .then((r) => setResults(r.data))
      .finally(() => setLoading(false));
  };

  const runMatching = async () => {
    setRunning(true);
    setMsg("");
    try {
      const res = await matchingApi.run();
      setMsg(res.data.message);
      load();
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Erreur lors du matching");
    } finally {
      setRunning(false);
    }
  };

  const scoreBar = (value: number, color: string) => (
    <div className="w-16 bg-gray-100 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%` }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matching IA</h1>
          <p className="text-gray-500 text-sm">{results.length} paires calculées</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} />Actualiser
          </button>
          <button onClick={runMatching} disabled={running} className="btn-primary flex items-center gap-2">
            <Play size={16} />
            {running ? "Calcul en cours..." : "Lancer le matching"}
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-200">{msg}</div>
      )}

      <div className="card flex gap-3 flex-wrap">
        <select className="input w-48" value={decision} onChange={(e) => { setDecision(e.target.value); }}>
          {DECISIONS.map((d) => <option key={d} value={d}>{d || "Toutes décisions"}</option>)}
        </select>
        <button className="btn-primary" onClick={load}>Filtrer</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-blue-700">Chargement...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Lauréat</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Offre</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Compét.</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">CV</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Localisa.</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Expér.</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Score final</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Décision</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Compétences communes</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3 font-medium text-blue-700">{r.id_laureat}</td>
                  <td className="py-2 px-3 text-gray-700">{r.id_offre}</td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold">{r.score_competences}%</span>
                      {scoreBar(r.score_competences, "bg-blue-500")}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold">{r.score_cv_offre}%</span>
                      {scoreBar(r.score_cv_offre, "bg-purple-500")}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold">{r.score_localisation}%</span>
                      {scoreBar(r.score_localisation, "bg-teal-500")}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-bold">{r.score_experience}%</span>
                      {scoreBar(r.score_experience, "bg-orange-500")}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`badge text-sm font-bold ${getScoreColor(r.score_final)}`}>
                      {r.score_final}%
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`badge ${getDecisionColor(r.decision)}`}>{r.decision}</span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.competences_communes || "").split("|").filter(Boolean).slice(0, 3).map((c) => (
                        <span key={c} className="badge bg-green-100 text-green-700 text-xs">{c.trim()}</span>
                      ))}
                      {(r.competences_manquantes || "").split("|").filter(Boolean).slice(0, 2).map((c) => (
                        <span key={c} className="badge bg-red-100 text-red-700 text-xs line-through">{c.trim()}</span>
                      ))}
                    </div>
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
