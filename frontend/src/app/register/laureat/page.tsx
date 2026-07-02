"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import SkillPicker from "@/components/SkillPicker";
import { authApi, documentsApi } from "@/services/api";
import { storeSession } from "@/lib/auth";

const NIVEAUX = ["Technicien", "Technicien Spécialisé", "Ingénieur", "Licence", "Master"];
const DISPONIBILITES = ["Immédiatement", "Sous 1 mois", "Stage uniquement"];

const STEPS = ["Compte", "Profil", "Compétences", "CV & Documents"];

export default function RegisterLaureatPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [diplomeFile, setDiplomeFile] = useState<File | null>(null);
  const [registered, setRegistered] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    nom: "",
    prenom: "",
    telephone: "",
    niveau_formation: NIVEAUX[1],
    filiere: "",
    annee_promotion: new Date().getFullYear(),
    localisation: "",
    disponibilite: DISPONIBILITES[0],
    linkedin: "",
    github_portfolio: "",
  });
  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const canNext = () => {
    if (step === 0) return form.full_name && form.email && form.password.length >= 6;
    if (step === 1) return form.nom && form.prenom && form.filiere && form.annee_promotion;
    return true;
  };

  const handleCreateAccount = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authApi.registerLaureat({
        ...form,
        annee_promotion: Number(form.annee_promotion),
        competences_techniques: techSkills,
        soft_skills: softSkills,
      });
      storeSession(res.data.access_token, res.data.user);
      setRegistered(true);
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (cvFile) await documentsApi.upload("CV", cvFile);
      if (diplomeFile) await documentsApi.upload("DIPLOME", diplomeFile);
    } catch {
      /* upload optionnel, on ne bloque pas l'inscription */
    } finally {
      setLoading(false);
      router.push("/candidat/offres");
    }
  };

  return (
    <>
      <PublicHeader />
      <section className="bg-cmc-sky py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Inscription Lauréat</h1>
            <p className="text-gray-500 text-sm mb-6">
              Complétez votre profil pour recevoir les offres les plus proches de vous.
            </p>

            <div className="flex items-center gap-2 mb-8">
              {STEPS.map((label, i) => (
                <div key={label} className="flex-1 flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i < step || (i === step && registered)
                        ? "bg-emerald-500 text-white"
                        : i === step
                        ? "bg-cmc-teal text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </span>
                  {i < STEPS.length - 1 && <span className="flex-1 h-0.5 bg-gray-100" />}
                </div>
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input className="input-cmc" value={form.full_name} onChange={set("full_name")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" className="input-cmc" value={form.email} onChange={set("email")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input type="password" minLength={6} className="input-cmc" value={form.password} onChange={set("password")} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input className="input-cmc" value={form.nom} onChange={set("nom")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input className="input-cmc" value={form.prenom} onChange={set("prenom")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input className="input-cmc" value={form.telephone} onChange={set("telephone")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input className="input-cmc" value={form.localisation} onChange={set("localisation")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de diplôme *</label>
                  <select className="input-cmc" value={form.niveau_formation} onChange={set("niveau_formation")}>
                    {NIVEAUX.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filière *</label>
                  <input className="input-cmc" value={form.filiere} onChange={set("filiere")} placeholder="ex: Développement Digital" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Année de promotion *</label>
                  <input type="number" className="input-cmc" value={form.annee_promotion} onChange={set("annee_promotion")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                  <select className="input-cmc" value={form.disponibilite} onChange={set("disponibilite")}>
                    {DISPONIBILITES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input className="input-cmc" value={form.linkedin} onChange={set("linkedin")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub / Portfolio</label>
                  <input className="input-cmc" value={form.github_portfolio} onChange={set("github_portfolio")} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compétences techniques</label>
                  <SkillPicker selected={techSkills} onChange={setTechSkills} placeholder="ex: Python, React, SQL..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soft skills</label>
                  <SkillPicker selected={softSkills} onChange={setSoftSkills} placeholder="ex: Communication, Travail en équipe..." />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {!registered ? (
                  <p className="text-sm text-gray-500">Créez d&apos;abord votre compte à l&apos;étape précédente.</p>
                ) : (
                  <>
                    <p className="text-sm text-emerald-600 font-medium">
                      Compte créé ! Ajoutez votre CV pour améliorer votre score de compatibilité (optionnel).
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CV (PDF)</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        className="input-cmc"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Diplôme (PDF, image)</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDiplomeFile(e.target.files?.[0] || null)}
                        className="input-cmc"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mt-4">{error}</div>}

            <div className="flex justify-between mt-8">
              {step > 0 && step < 3 && (
                <button onClick={() => setStep(step - 1)} className="btn-secondary">
                  Précédent
                </button>
              )}
              <div className="flex-1" />
              {step < 2 && (
                <button disabled={!canNext()} onClick={() => setStep(step + 1)} className="btn-cmc">
                  Suivant
                </button>
              )}
              {step === 2 && (
                <button disabled={loading} onClick={handleCreateAccount} className="btn-cmc">
                  {loading ? "Création..." : "Créer mon compte"}
                </button>
              )}
              {step === 3 && registered && (
                <button disabled={loading} onClick={handleFinish} className="btn-cmc">
                  {loading ? "Finalisation..." : "Terminer et voir mes offres"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}
