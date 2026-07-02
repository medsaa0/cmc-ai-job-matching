"use client";
import { useEffect, useState } from "react";
import { Building2, Check, X } from "lucide-react";
import { entreprisesApi } from "@/services/api";
import type { Entreprise } from "@/types";

const STATUT_STYLES: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  validee: "bg-emerald-100 text-emerald-700",
  rejetee: "bg-red-100 text-red-700",
};

export default function AdminEntreprisesPage() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    entreprisesApi
      .list(filter ? { statut: filter } : {})
      .then((r) => setEntreprises(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleValider = async (id: number) => {
    await entreprisesApi.valider(id);
    load();
  };
  const handleRejeter = async (id: number) => {
    await entreprisesApi.rejeter(id);
    load();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
        <p className="text-gray-500 text-sm">{entreprises.length} entreprises</p>
      </div>

      <div className="card flex gap-2">
        {["", "en_attente", "validee", "rejetee"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filter === s ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            {s === "" ? "Toutes" : s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-blue-700">Chargement...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {entreprises.map((e) => (
            <div key={e.id} className="card">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                  <Building2 size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{e.raison_sociale}</span>
                    <span className={`badge ${STATUT_STYLES[e.statut_validation]}`}>{e.statut_validation}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{e.secteur} · {e.ville}</p>
                  <p className="text-xs text-gray-500">{e.contact_nom} — {e.contact_telephone}</p>
                  {e.description && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{e.description}</p>}
                </div>
              </div>
              {e.statut_validation === "en_attente" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleValider(e.id)} className="btn-primary flex items-center gap-1 text-sm">
                    <Check size={14} /> Valider
                  </button>
                  <button onClick={() => handleRejeter(e.id)} className="btn-secondary flex items-center gap-1 text-sm">
                    <X size={14} /> Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
          {entreprises.length === 0 && <p className="text-gray-400">Aucune entreprise.</p>}
        </div>
      )}
    </div>
  );
}
