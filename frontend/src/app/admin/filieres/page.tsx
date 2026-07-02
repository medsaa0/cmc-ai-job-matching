"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { filieresApi } from "@/services/api";
import { Filiere } from "@/types";
import { Search, BookOpen } from "lucide-react";

export default function FilieresPage() {
  const router = useRouter();
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [domaine, setDomaine] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    load();
  }, []);

  const load = () => {
    setLoading(true);
    filieresApi.list({ q, domaine, limit: 100 })
      .then((r) => setFilieres(r.data))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Filières</h1>
        <p className="text-gray-500 text-sm">{filieres.length} filières</p>
      </div>

      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Nom de filière..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <input className="input w-44" placeholder="Domaine..." value={domaine} onChange={(e) => setDomaine(e.target.value)} />
        <button className="btn-primary" onClick={load}>Filtrer</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-blue-700">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filieres.map((f) => (
            <div key={f.id} className="card hover:border-blue-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                  <BookOpen size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{f.nom_filiere}</span>
                    <span className="badge bg-gray-100 text-gray-500">{f.id_filiere}</span>
                  </div>
                  <span className="badge bg-purple-100 text-purple-700 mt-1">{f.domaine}</span>
                  <p className="text-xs text-gray-500 mt-1">{f.niveau_formation} — {f.niveau_acces}</p>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">{f.description}</p>
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Compétences cibles :</p>
                    <div className="flex flex-wrap gap-1">
                      {(f.competences_cibles || "").split("|").filter(Boolean).slice(0, 4).map((c) => (
                        <span key={c} className="badge bg-blue-100 text-blue-700 text-xs">{c.trim()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
