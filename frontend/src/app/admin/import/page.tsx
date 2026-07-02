"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { importApi } from "@/services/api";
import { Upload, CheckCircle, XCircle, Loader } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

interface ImportResult {
  status: Status;
  message: string;
  details?: string;
}

const initialResult = (): ImportResult => ({ status: "idle", message: "", details: "" });

export default function ImportPage() {
  const router = useRouter();
  const [results, setResults] = useState<Record<string, ImportResult>>({
    filieres: initialResult(),
    competences: initialResult(),
    laureats: initialResult(),
    offres: initialResult(),
    all: initialResult(),
  });

  const doImport = async (key: string, fn: () => Promise<any>) => {
    setResults((prev) => ({ ...prev, [key]: { status: "loading", message: "Import en cours...", details: "" } }));
    try {
      const res = await fn();
      const d = res.data;
      const msg = key === "all"
        ? Object.entries(d).map(([k, v]: any) => `${k}: +${v.inserted} (${v.skipped} existants)`).join(" | ")
        : `${d.inserted} insérés, ${d.skipped} existants ignorés`;
      setResults((prev) => ({ ...prev, [key]: { status: "success", message: "Import réussi !", details: msg } }));
    } catch (e: any) {
      setResults((prev) => ({
        ...prev,
        [key]: { status: "error", message: "Erreur lors de l'import", details: e.response?.data?.detail || e.message },
      }));
    }
  };

  const imports = [
    { key: "filieres", label: "Filières", fn: importApi.filieres, desc: "filieres.csv" },
    { key: "competences", label: "Compétences", fn: importApi.competences, desc: "competences.csv" },
    { key: "laureats", label: "Lauréats", fn: importApi.laureats, desc: "laureats.csv" },
    { key: "offres", label: "Offres d'emploi", fn: importApi.offres, desc: "offres.csv" },
  ];

  const StatusIcon = ({ status }: { status: Status }) => {
    if (status === "loading") return <Loader size={18} className="text-blue-500 animate-spin" />;
    if (status === "success") return <CheckCircle size={18} className="text-green-600" />;
    if (status === "error") return <XCircle size={18} className="text-red-600" />;
    return <Upload size={18} className="text-gray-400" />;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import CSV</h1>
        <p className="text-gray-500 text-sm">Importer les données depuis les fichiers CSV du dossier data/raw/</p>
      </div>

      <div className="card space-y-3">
        {imports.map(({ key, label, fn, desc }) => (
          <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <StatusIcon status={results[key].status} />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{label}</div>
              <div className="text-xs text-gray-400">{desc}</div>
              {results[key].details && (
                <div className={`text-xs mt-0.5 ${results[key].status === "error" ? "text-red-600" : "text-green-600"}`}>
                  {results[key].details}
                </div>
              )}
            </div>
            <button
              onClick={() => doImport(key, fn)}
              disabled={results[key].status === "loading"}
              className="btn-primary text-sm py-1.5 px-4"
            >
              Importer
            </button>
          </div>
        ))}
      </div>

      <div className="card border-2 border-dashed border-blue-300 bg-blue-50">
        <div className="flex items-center gap-4">
          <StatusIcon status={results.all.status} />
          <div className="flex-1">
            <div className="font-semibold text-blue-800">Tout importer en une seule fois</div>
            <div className="text-xs text-blue-600">Filières + Compétences + Lauréats + Offres</div>
            {results.all.details && (
              <div className={`text-xs mt-0.5 ${results.all.status === "error" ? "text-red-600" : "text-green-700"}`}>
                {results.all.details}
              </div>
            )}
          </div>
          <button
            onClick={() => doImport("all", importApi.all)}
            disabled={results.all.status === "loading"}
            className="btn-primary"
          >
            Tout importer
          </button>
        </div>
      </div>

      <div className="card bg-gray-50 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-700">Format des fichiers :</p>
        <p>• Séparateur de colonnes : <code className="bg-gray-200 px-1 rounded">;</code></p>
        <p>• Séparateur de listes internes : <code className="bg-gray-200 px-1 rounded">|</code></p>
        <p>• Encodage : UTF-8</p>
        <p>• Emplacement : <code className="bg-gray-200 px-1 rounded">backend/app/data/raw/</code></p>
      </div>
    </div>
  );
}
