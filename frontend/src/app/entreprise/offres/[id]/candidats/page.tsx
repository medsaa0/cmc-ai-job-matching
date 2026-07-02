"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { matchingApi, candidaturesApi, offresApi, exportApi } from "@/services/api";
import type { MatchingResult, Candidature, Offre } from "@/types";

export default function OffreCandidatsPage() {
  const params = useParams();
  const id = params.id as string;
  const [offre, setOffre] = useState<Offre | null>(null);
  const [rows, setRows] = useState<MatchingResult[]>([]);
  const [applications, setApplications] = useState<Record<string, Candidature>>({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      offresApi.get(id),
      matchingApi.topLaureats(id, 100),
      candidaturesApi.forOffre(id),
    ])
      .then(([oRes, mRes, cRes]) => {
        setOffre(oRes.data);
        setRows(mRes.data);
        const byLaureat: Record<string, Candidature> = {};
        (cRes.data as Candidature[]).forEach((c) => (byLaureat[c.id_laureat] = c));
        setApplications(byLaureat);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportApi.matchingOffre(id);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Lauréats les plus compatibles</h1>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> {exporting ? "Export..." : "Exporter en CSV"}
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">{offre?.titre_poste}</p>

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-400">Aucun lauréat correspondant pour le moment.</p>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Lauréat</th>
                <th className="text-left px-4 py-3">Compétences communes</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Décision</th>
                <th className="text-left px-4 py-3">Candidature</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const app = applications[r.id_laureat];
                return (
                  <tr key={r.id_laureat} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.id_laureat}</td>
                    <td className="px-4 py-3 text-gray-500">{r.competences_communes || "—"}</td>
                    <td className="px-4 py-3 font-bold text-cmc-teal-dark">{Math.round(r.score_final)}%</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-gray-100 text-gray-600">{r.decision}</span>
                    </td>
                    <td className="px-4 py-3">
                      {app ? (
                        <span className="badge bg-emerald-100 text-emerald-700">A postulé</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
