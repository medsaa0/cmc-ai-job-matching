"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { competencesApi } from "@/services/api";
import { Competence } from "@/types";
import { Search, Award } from "lucide-react";

export default function CompetencesPage() {
  const router = useRouter();
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [domaine, setDomaine] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    load();
  }, []);

  const load = () => {
    setLoading(true);
    competencesApi.list({ q, domaine, limit: 200 })
      .then((r) => setCompetences(r.data))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compétences</h1>
        <p className="text-gray-500 text-sm">{competences.length} compétences référencées</p>
      </div>

      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <input className="input w-44" placeholder="Domaine..." value={domaine} onChange={(e) => setDomaine(e.target.value)} />
        <button className="btn-primary" onClick={load}>Filtrer</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-blue-700">Chargement...</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">ID</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Compétence</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Catégorie</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Domaine</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Synonymes</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Poids</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Niveau</th>
              </tr>
            </thead>
            <tbody>
              {competences.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-400 text-xs">{c.id_competence}</td>
                  <td className="py-2 px-3">
                    <span className="flex items-center gap-2 font-medium">
                      <Award size={14} className="text-teal-600" />
                      {c.competence}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="badge bg-gray-100 text-gray-600">{c.categorie}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="badge bg-blue-100 text-blue-700">{c.domaine}</span>
                  </td>
                  <td className="py-2 px-3 text-gray-500 text-xs max-w-xs truncate">
                    {(c.synonymes || "").split("|").join(", ")}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="w-12 bg-gray-100 rounded-full h-1.5 mx-auto">
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${(c.poids || 0) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{c.poids}</span>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-600">{c.niveau_recommande}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
