"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { competencesApi } from "@/services/api";
import type { Competence } from "@/types";

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
        {selected.map((s) => (
          <span key={s} className="badge bg-cmc-sky text-cmc-teal-dark flex items-center gap-1">
            {s}
            <button type="button" onClick={() => onChange(selected.filter((x) => x !== s))}>
              <X size={12} />
            </button>
          </span>
        ))}
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
      <p className="text-xs text-gray-400 mt-1">Entrée pour ajouter une compétence libre.</p>
    </div>
  );
}
