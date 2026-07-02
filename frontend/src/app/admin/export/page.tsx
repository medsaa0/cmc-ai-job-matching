"use client";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { exportApi, offresApi } from "@/services/api";
import type { Offre } from "@/types";

export default function AdminExportPage() {
  const [offres, setOffres] = useState<Offre[]>([]);
  const [selectedOffre, setSelectedOffre] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    offresApi.list({ limit: 300 }).then((r) => setOffres(r.data));
  }, []);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Export CSV</h1>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900">Données globales</h2>
        <div className="flex gap-3">
          <button
            onClick={() => run("laureats", exportApi.laureats)}
            disabled={busy === "laureats"}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={16} /> Lauréats
          </button>
          <button
            onClick={() => run("offres", exportApi.offres)}
            disabled={busy === "offres"}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={16} /> Offres
          </button>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900">Classement de matching pour une offre</h2>
        <select className="input" value={selectedOffre} onChange={(e) => setSelectedOffre(e.target.value)}>
          <option value="">Sélectionner une offre...</option>
          {offres.map((o) => (
            <option key={o.id_offre} value={o.id_offre}>{o.titre_poste} — {o.entreprise}</option>
          ))}
        </select>
        <button
          disabled={!selectedOffre || busy === "matching"}
          onClick={() => run("matching", () => exportApi.matchingOffre(selectedOffre))}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={16} /> Exporter le classement
        </button>
      </div>
    </div>
  );
}
