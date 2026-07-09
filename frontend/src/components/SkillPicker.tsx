"use client";
import { useEffect, useMemo, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { competencesApi } from "@/services/api";
import type { Competence } from "@/types";

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function SkillPicker({
  selected,
  onChange,
  placeholder = "Rechercher une compétence...",
}: {
  selected: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}) {
  const [all, setAll] = useState<Competence[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    competencesApi.list().then((r) => setAll(r.data)).catch(() => {});
  }, []);

  // Toutes les valeurs (nom + synonymes) reconnues par le catalogue, normalisees.
  // Sert a signaler une competence tapee librement qui ne correspondra a rien
  // cote matching (voir backend/app/services/matching_service.py::_build_synonym_map).
  const knownNormalized = useMemo(() => {
    const set = new Set<string>();
    for (const c of all) {
      set.add(normalize(c.competence));
      for (const syn of (c.synonymes || "").split("|")) {
        if (syn.trim()) set.add(normalize(syn));
      }
    }
    return set;
  }, [all]);

  const isKnown = (skill: string) => knownNormalized.size === 0 || knownNormalized.has(normalize(skill));

  const suggestions = all
    .filter((c) => c.competence.toLowerCase().includes(query.toLowerCase()))
    .filter((c) => !selected.includes(c.competence))
    .slice(0, 8);

  const addSkill = (name: string) => {
    if (!name.trim() || selected.includes(name)) return;
    onChange([...selected, name.trim()]);
    setQuery("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((s) => {
          const known = isKnown(s);
          return (
            <span
              key={s}
              className={`badge flex items-center gap-1 ${known ? "bg-cmc-sky text-cmc-teal-dark" : "bg-amber-50 text-amber-700"}`}
              title={known ? undefined : "Compétence non reconnue du catalogue : elle contribuera peu au score de matching."}
            >
              {!known && <AlertTriangle size={11} />}
              {s}
              <button type="button" onClick={() => onChange(selected.filter((x) => x !== s))}>
                <X size={12} />
              </button>
            </span>
          );
        })}
      </div>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill(query);
            }
          }}
          placeholder={placeholder}
          className="input-cmc"
        />
        {query && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
            {suggestions.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => addSkill(c.competence)}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-cmc-sky"
              >
                {c.competence}
                <span className="text-xs text-gray-400 ml-2">{c.categorie}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Entrée pour ajouter une compétence libre. Choisissez une suggestion pour un meilleur matching.
      </p>
    </div>
  );
}
