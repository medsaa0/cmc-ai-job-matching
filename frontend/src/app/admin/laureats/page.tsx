"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { laureatsApi, matchingApi } from "@/services/api";
import { Laureat, MatchingResult } from "@/types";
import { Search, User, MapPin, GraduationCap, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { getScoreColor, getDecisionColor } from "@/utils/score";

export default function LaureatsPage() {
  const router = useRouter();
  const [laureats, setLaureats] = useState<Laureat[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filiere, setFiliere] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [selected, setSelected] = useState<Laureat | null>(null);
  const [topOffres, setTopOffres] = useState<MatchingResult[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    load();
  }, []);

  const load = () => {
    setLoading(true);
    laureatsApi.list({ q, filiere, localisation, limit: 100 })
      .then((r) => setLaureats(r.data))
      .finally(() => setLoading(false));
  };

  const openDetail = async (l: Laureat) => {
    setSelected(selected?.id === l.id ? null : l);
    const res = await matchingApi.topOffres(l.id_laureat, 5);
    setTopOffres(res.data);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lauréats</h1>
          <p className="text-gray-500 text-sm">{laureats.length} profils trouvés</p>
        </div>
      </div>

      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Rechercher par nom..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <input className="input w-48" placeholder="Filière..." value={filiere} onChange={(e) => setFiliere(e.target.value)} />
        <input className="input w-40" placeholder="Ville..." value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
        <button className="btn-primary" onClick={load}>Filtrer</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-blue-700">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {laureats.map((l) => (
            <div key={l.id} className="card cursor-pointer hover:border-blue-300 transition-all">
              <div className="flex items-center gap-4" onClick={() => openDetail(l)}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                  {l.prenom?.[0]}{l.nom?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{l.prenom} {l.nom}</span>
                    <span className="badge bg-gray-100 text-gray-600">{l.id_laureat}</span>
                    <span className={`badge ${l.statut_profil === "Valide" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {l.statut_profil}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1"><GraduationCap size={13} />{l.filiere}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} />{l.localisation}</span>
                    <span>{l.disponibilite}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  {selected?.id === l.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {selected?.id === l.id && (
                <div className="mt-4 border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Compétences techniques</p>
                      <div className="flex flex-wrap gap-1">
                        {(l.competences_techniques || "").split("|").filter(Boolean).map((c) => (
                          <span key={c} className="badge bg-blue-100 text-blue-700">{c.trim()}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Soft skills</p>
                      <div className="flex flex-wrap gap-1">
                        {(l.soft_skills || "").split("|").filter(Boolean).map((c) => (
                          <span key={c} className="badge bg-purple-100 text-purple-700">{c.trim()}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Expériences</p>
                      <p className="text-sm text-gray-700">{l.experiences || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Mobilité</p>
                      <p className="text-sm text-gray-700">{(l.mobilite || "").split("|").join(", ")}</p>
                    </div>
                  </div>

                  {topOffres.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top offres recommandées</p>
                      <div className="space-y-1">
                        {topOffres.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                            <span className={`badge ${getDecisionColor(m.decision)}`}>{m.decision}</span>
                            <span className="text-gray-700 flex-1">{m.id_offre}</span>
                            <span className={`badge ${getScoreColor(m.score_final)}`}>{m.score_final}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {l.linkedin && <a href={l.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1"><ExternalLink size={14} />LinkedIn</a>}
                    {l.github_portfolio && <a href={l.github_portfolio} target="_blank" rel="noreferrer" className="text-gray-700 hover:underline text-sm flex items-center gap-1"><ExternalLink size={14} />GitHub</a>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
