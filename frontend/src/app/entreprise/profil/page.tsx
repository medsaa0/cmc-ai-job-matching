"use client";
import { useEffect, useState } from "react";
import { entreprisesApi } from "@/services/api";
import type { Entreprise } from "@/types";

const STATUT_STYLES: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-700",
  validee: "bg-emerald-100 text-emerald-700",
  rejetee: "bg-red-100 text-red-700",
};

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente de validation",
  validee: "Validée par le CMC",
  rejetee: "Compte rejeté",
};

export default function EntrepriseProfilPage() {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    entreprisesApi.me().then((r) => setEntreprise(r.data));
  }, []);

  if (!entreprise) return <p className="text-gray-400">Chargement...</p>;

  const set = (field: keyof Entreprise) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEntreprise({ ...entreprise, [field]: e.target.value } as Entreprise);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await entreprisesApi.updateMe({
        raison_sociale: entreprise.raison_sociale,
        secteur: entreprise.secteur,
        description: entreprise.description,
        ville: entreprise.ville,
        site_web: entreprise.site_web,
        contact_nom: entreprise.contact_nom,
        contact_telephone: entreprise.contact_telephone,
      });
      setMessage("Profil mis à jour.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon entreprise</h1>
        <span className={`badge ${STATUT_STYLES[entreprise.statut_validation]}`}>
          {STATUT_LABELS[entreprise.statut_validation]}
        </span>
      </div>

      {entreprise.statut_validation === "en_attente" && (
        <div className="bg-amber-50 text-amber-700 text-sm p-4 rounded-lg">
          Votre compte est en cours de vérification par le CMC. Vous pourrez publier des offres dès
          validation.
        </div>
      )}

      {message && <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg">{message}</div>}

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale</label>
            <input className="input" value={entreprise.raison_sociale || ""} onChange={set("raison_sociale")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
            <input className="input" value={entreprise.secteur || ""} onChange={set("secteur")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input className="input" value={entreprise.ville || ""} onChange={set("ville")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input className="input" value={entreprise.contact_nom || ""} onChange={set("contact_nom")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input className="input" value={entreprise.contact_telephone || ""} onChange={set("contact_telephone")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
            <input className="input" value={entreprise.site_web || ""} onChange={set("site_web")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className="input" value={entreprise.description || ""} onChange={set("description")} />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          Enregistrer
        </button>
      </div>
    </div>
  );
}
