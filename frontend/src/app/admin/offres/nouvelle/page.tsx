"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { competencesApi, offresApi } from "@/services/api";
import type { Competence } from "@/types";

const TYPES_CONTRAT = ["Stage", "PFE", "Emploi"];
const NIVEAUX_EXP = ["Débutant", "1-2 ans", "3-5 ans", "5 ans et plus"];
const NIVEAUX_FORMATION = ["Technicien", "Technicien Spécialisé", "Ingénieur", "Licence", "Master"];

type CompetenceReq = { id_competence: number; competence: string; importance: number; obligatoire: boolean };

const STEPS = ["Poste", "Profil recherché", "Compétences", "Récapitulatif"];

export default function NouvelleOffreAdminPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allCompetences, setAllCompetences] = useState<Competence[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CompetenceReq[]>([]);

  const [form, setForm] = useState({
    entreprise_nom: "CMC de l'Oriental",
    titre_poste: "",
    domaine: "",
    localisation: "",
    type_contrat: TYPES_CONTRAT[0],
    niveau_experience: NIVEAUX_EXP[0],
    description: "",
    niveau_formation_requis: NIVEAUX_FORMATION[1],
    filiere_requise: "",
  });

  useEffect(() => {
    competencesApi.list().then((r) => setAllCompetences(r.data));
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const suggestions = allCompetences
    .filter((c) => c.competence.toLowerCase().includes(query.toLowerCase()))
    .filter((c) => !selected.some((s) => s.id_competence === c.id))
    .slice(0, 8);

  const addCompetence = (c: Competence) => {
    setSelected([...selected, { id_competence: c.id, competence: c.competence, importance: 2, obligatoire: false }]);
    setQuery("");
  };

  const updateCompetence = (id: number, patch: Partial<CompetenceReq>) => {
    setSelected(selected.map((s) => (s.id_competence === id ? { ...s, ...patch } : s)));
  };

  const canNext = () => {
    if (step === 0) return form.titre_poste && form.domaine && form.localisation && form.description;
    if (step === 1) return form.niveau_formation_requis && form.filiere_requise;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await offresApi.createAsAdmin({
        ...form,
        competences: selected.map((s) => ({
          id_competence: s.id_competence,
          importance: s.importance,
          obligatoire: s.obligatoire,
        })),
      });
      router.push("/admin/offres");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Publier une offre CMC</h1>
      <p className="text-gray-500 text-sm mb-6">
        Utilisez ce formulaire pour publier une offre au nom du CMC ou d&apos;un partenaire sans compte.
      </p>

      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              i === step ? "bg-primary text-white" : i < step ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
            }`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      <div className="card space-y-4">
        {step === 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;entreprise affiché</label>
              <input className="input" value={form.entreprise_nom} onChange={set("entreprise_nom")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste *</label>
              <input className="input" value={form.titre_poste} onChange={set("titre_poste")} placeholder="ex: Développeur Fullstack Junior" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domaine *</label>
                <input className="input" value={form.domaine} onChange={set("domaine")} placeholder="ex: Digital & IT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localisation *</label>
                <input className="input" value={form.localisation} onChange={set("localisation")} placeholder="ex: Oujda" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
                <select className="input" value={form.type_contrat} onChange={set("type_contrat")}>
                  {TYPES_CONTRAT.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expérience requise</label>
                <select className="input" value={form.niveau_experience} onChange={set("niveau_experience")}>
                  {NIVEAUX_EXP.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description du poste *</label>
              <textarea rows={4} className="input" value={form.description} onChange={set("description")} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de diplôme requis *</label>
              <select className="input" value={form.niveau_formation_requis} onChange={set("niveau_formation_requis")}>
                {NIVEAUX_FORMATION.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filière requise *</label>
              <input className="input" value={form.filiere_requise} onChange={set("filiere_requise")} placeholder="ex: Développement Digital" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une compétence..."
                className="input"
              />
              {query && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {suggestions.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => addCompetence(c)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {c.competence} <span className="text-xs text-gray-400 ml-2">{c.categorie}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {selected.map((s) => (
                <div key={s.id_competence} className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm font-medium text-gray-700">{s.competence}</span>
                  <select
                    className="input w-auto text-xs"
                    value={s.importance}
                    onChange={(e) => updateCompetence(s.id_competence, { importance: Number(e.target.value) })}
                  >
                    <option value={1}>Utile</option>
                    <option value={2}>Importante</option>
                    <option value={3}>Essentielle</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={s.obligatoire}
                      onChange={(e) => updateCompetence(s.id_competence, { obligatoire: e.target.checked })}
                    />
                    Obligatoire
                  </label>
                  <button onClick={() => setSelected(selected.filter((x) => x.id_competence !== s.id_competence))}>
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              ))}
              {selected.length === 0 && <p className="text-sm text-gray-400">Aucune compétence sélectionnée.</p>}
            </div>
          </>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Entreprise :</span> {form.entreprise_nom}</p>
            <p><span className="text-gray-500">Poste :</span> <span className="font-semibold">{form.titre_poste}</span></p>
            <p><span className="text-gray-500">Domaine :</span> {form.domaine} · <span className="text-gray-500">Lieu :</span> {form.localisation}</p>
            <p><span className="text-gray-500">Contrat :</span> {form.type_contrat} · <span className="text-gray-500">Expérience :</span> {form.niveau_experience}</p>
            <p><span className="text-gray-500">Diplôme :</span> {form.niveau_formation_requis} · <span className="text-gray-500">Filière :</span> {form.filiere_requise}</p>
            <div>
              <span className="text-gray-500">Compétences :</span>{" "}
              {selected.length === 0 ? "aucune" : selected.map((s) => s.competence).join(", ")}
            </div>
          </div>
        )}

        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

        <div className="flex justify-between pt-2">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">Précédent</button>
          ) : <span />}
          {step < 3 ? (
            <button disabled={!canNext()} onClick={() => setStep(step + 1)} className="btn-primary">Suivant</button>
          ) : (
            <button disabled={loading} onClick={handleSubmit} className="btn-primary">
              {loading ? "Publication..." : "Publier l'offre"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
