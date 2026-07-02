"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { offresApi, entreprisesApi } from "@/services/api";
import type { Offre, Entreprise } from "@/types";

export default function EntrepriseOffresPage() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([offresApi.mine(), entreprisesApi.me()])
      .then(([oRes, eRes]) => {
        setOffres(oRes.data);
        setEntreprise(eRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const canPost = entreprise?.statut_validation === "validee";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes offres</h1>
        {canPost && (
          <Link href="/entreprise/offres/nouvelle" className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} /> Nouvelle offre
          </Link>
        )}
      </div>

      {!canPost && entreprise && (
        <div className="bg-amber-50 text-amber-700 text-sm p-4 rounded-lg mb-6">
          Votre compte doit être validé par le CMC avant de pouvoir publier des offres.
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : offres.length === 0 ? (
        <p className="text-gray-400">Vous n&apos;avez pas encore publié d&apos;offre.</p>
      ) : (
        <div className="space-y-3">
          {offres.map((o) => (
            <div key={o.id_offre} className="card flex items-center justify-between gap-4">
              <div>
                <span className="badge bg-primary/10 text-primary mb-1 inline-block">{o.type_contrat}</span>
                <h3 className="font-semibold text-gray-900">{o.titre_poste}</h3>
                <p className="text-sm text-gray-500">{o.localisation} · {o.statut_offre}</p>
              </div>
              <Link
                href={`/entreprise/offres/${o.id_offre}/candidats`}
                className="btn-secondary flex items-center gap-2 flex-shrink-0"
              >
                <Users size={16} /> Voir les candidats
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
