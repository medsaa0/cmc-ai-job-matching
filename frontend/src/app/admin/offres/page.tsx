"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { offresApi, matchingApi } from "@/services/api";
import { Offre, MatchingResult } from "@/types";
import { Search, MapPin, Building2, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { getScoreColor } from "@/utils/score";

const statusColor: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "A valider": "bg-yellow-100 text-yellow-700",
  Clôturée: "bg-gray-100 text-gray-600",
};

export default function OffresPage() {
  const router = useRouter();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [domaine, setDomaine] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [selected, setSelected] = useState<Offre | null>(null);
  const [topLaureats, setTopLaureats] = useState<MatchingResult[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    load();
  }, []);

  const load = () => {
    setLoading(true);
    offresApi.list({ q, domaine, localisation, limit: 100 })
      .then((r) => setOffres(r.data))
      .finally(() => setLoading(false));
  };

  const openDetail = async (o: Offre) => {
    setSelected(selected?.id === o.id ? null : o);
    const res = await matchingApi.topLaureats(o.id_offre, 5);
    setTopLaureats(res.data);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offres d&apos;emploi</h1>
          <p className="text-gray-500 text-sm">{offres.length} offres trouvées</p>
        </div>
        <Link href="/admin/offres/nouvelle" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> Publier une offre CMC
        </Link>
      </div>

      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Titre ou entreprise..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <input className="input w-44" placeholder="Domaine..." value={domaine} onChange={(e) => setDomaine(e.target.value)} />
        <input className="input w-36" placeholder="Ville..." value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
        <button className="btn-primary" onClick={load}>Filtrer</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-blue-700">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {offres.map((o) => (
            <div key={o.id} className="card cursor-pointer hover:border-blue-300 transition-all">
              <div className="flex items-center gap-4" onClick={() => openDetail(o)}>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{o.titre_poste}</span>
                    <span className="badge bg-gray-100 text-gray-600">{o.id_offre}</span>
                    <span className={`badge ${statusColor[o.statut_offre] || "bg-gray-100 text-gray-600"}`}>{o.statut_offre}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1"><Building2 size={13} />{o.entreprise}</span>
                    <span className="flex items-center gap-1"><MapPin size={13} />{o.localisation}</span>
                    <span>{o.type_contrat}</span>
                    <span>{o.domaine}</span>
                  </div>
                </div>
                {selected?.id === o.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </div>

              {selected?.id === o.id && (
                <div className="mt-4 border-t pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Compétences requises</p>
                      <div className="flex flex-wrap gap-1">
                        {(o.competences_requises || "").split("|").filter(Boolean).map((c) => (
                          <span key={c} className="badge bg-blue-100 text-blue-700">{c.trim()}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{o.description}</p>
                    </div>
                  </div>

                  {topLaureats.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top lauréats compatibles</p>
                      <div className="space-y-1">
                        {topLaureats.map((m) => (
                          <div key={m.id} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded-lg">
                            <span className="text-gray-700 flex-1">{m.id_laureat}</span>
                            <span className="text-xs text-gray-500">Compétences : {m.score_competences}%</span>
                            <span className={`badge ${getScoreColor(m.score_final)}`}>{m.score_final}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
