"use client";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import OffreCard from "@/components/OffreCard";
import { offresApi } from "@/services/api";
import { classifyOfferType, type OffreCategorie } from "@/lib/offerType";
import type { Offre } from "@/types";

const TYPES: { value: OffreCategorie | ""; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "Stage", label: "Stage" },
  { value: "PFE", label: "PFE" },
  { value: "Emploi", label: "Emploi" },
];

export default function PublicOffresPage() {
  const [allOffres, setAllOffres] = useState<Offre[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<OffreCategorie | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offresApi
      .list({ statut: "Active", limit: 500 })
      .then((r) => setAllOffres(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return allOffres.filter((o) => {
      if (type && classifyOfferType(o.type_contrat) !== type) return false;
      if (query && !`${o.titre_poste} ${o.entreprise}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [allOffres, q, type]);

  const counts = useMemo(
    () => ({
      Stage: allOffres.filter((o) => classifyOfferType(o.type_contrat) === "Stage").length,
      PFE: allOffres.filter((o) => classifyOfferType(o.type_contrat) === "PFE").length,
      Emploi: allOffres.filter((o) => classifyOfferType(o.type_contrat) === "Emploi").length,
    }),
    [allOffres]
  );

  return (
    <>
      <PublicHeader />

      <section className="bg-cmc-hero py-16 text-center">
        <p className="text-cmc-sky/60 text-sm mb-2">Accueil → Offres</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">Toutes les Offres</h1>
        <p className="text-cmc-sky/70 mt-2">Trouvez votre stage, PFE ou emploi</p>
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <span className="pill bg-white/10 text-white border border-white/10">{counts.Stage} Stages disponibles</span>
          <span className="pill bg-white/10 text-white border border-white/10">{counts.PFE} PFE disponibles</span>
          <span className="pill bg-white/10 text-white border border-white/10">{counts.Emploi} Emplois disponibles</span>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 -mt-8 relative">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un stage, PFE, emploi..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cmc-teal"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === t.value ? "bg-cmc-teal text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-400 whitespace-nowrap">{filtered.length} offres trouvées</span>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-center text-gray-400">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">Aucune offre ne correspond à votre recherche.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map((o) => (
              <OffreCard key={o.id_offre} offre={o} />
            ))}
          </div>
        )}
      </section>

      <PublicFooter />
    </>
  );
}
