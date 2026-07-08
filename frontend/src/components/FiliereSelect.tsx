"use client";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { filieresApi } from "@/services/api";
import type { Filiere } from "@/types";

export default function FiliereSelect({
  value,
  onChange,
  placeholder = "Rechercher une filière...",
}: {
  value: string;
  onChange: (nomFiliere: string) => void;
  placeholder?: string;
}) {
  const [all, setAll] = useState<Filiere[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    filieresApi.list().then((r) => setAll(r.data)).catch(() => {});
  }, []);

  const suggestions = all
    .filter((f) => f.nom_filiere.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 8);

  const isKnown = value.trim() !== "" && all.some((f) => f.nom_filiere.toLowerCase() === value.trim().toLowerCase());

  const select = (f: Filiere) => {
    onChange(f.nom_filiere);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        className="input-cmc"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && value && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {suggestions.map((f) => (
            <button
              type="button"
              key={f.id_filiere}
              onMouseDown={() => select(f)}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-cmc-sky"
            >
              {f.nom_filiere} <span className="text-xs text-gray-400 ml-2">{f.domaine}</span>
            </button>
          ))}
        </div>
      )}
      {!isKnown && value.trim() !== "" && (
        <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
          <AlertTriangle size={12} />
          Filière non reconnue : choisissez une suggestion pour un meilleur matching par domaine.
        </p>
      )}
    </div>
  );
}
