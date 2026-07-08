"use client";
import { useEffect, useState } from "react";
import { Download, FileText, Sparkles, AlertTriangle } from "lucide-react";
import SkillPicker from "@/components/SkillPicker";
import { laureatsApi, documentsApi } from "@/services/api";
import type { Laureat, DocumentItem, CvAnalyse } from "@/types";

const DOC_TYPES = [
  { value: "CV", label: "CV" },
  { value: "DIPLOME", label: "Diplôme" },
  { value: "CIN", label: "CIN" },
  { value: "LETTRE_MOTIVATION", label: "Lettre de motivation" },
  { value: "AUTRE", label: "Autre" },
];

export default function CandidatProfilPage() {
  const [laureat, setLaureat] = useState<Laureat | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [techSkills, setTechSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadType, setUploadType] = useState("CV");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const load = () => {
    laureatsApi.me().then((r) => {
      setLaureat(r.data);
      setTechSkills((r.data.competences_techniques || "").split("|").filter(Boolean));
      setSoftSkills((r.data.soft_skills || "").split("|").filter(Boolean));
    });
    documentsApi.me().then((r) => setDocuments(r.data));
  };

  useEffect(load, []);

  if (!laureat) return <p className="text-gray-400">Chargement...</p>;

  const cvAnalyse: CvAnalyse | null = laureat.cv_analyse_json ? JSON.parse(laureat.cv_analyse_json) : null;

  const set = (field: keyof Laureat) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setLaureat({ ...laureat, [field]: e.target.value } as Laureat);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      await laureatsApi.updateMe({
        nom: laureat.nom,
        prenom: laureat.prenom,
        telephone: laureat.telephone,
        niveau_formation: laureat.niveau_formation,
        filiere: laureat.filiere,
        annee_promotion: Number(laureat.annee_promotion),
        localisation: laureat.localisation,
        disponibilite: laureat.disponibilite,
        linkedin: laureat.linkedin,
        github_portfolio: laureat.github_portfolio,
        experiences: laureat.experiences,
      });
      setMessage("Profil mis à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSkills = async () => {
    setSaving(true);
    try {
      await laureatsApi.updateCompetences(techSkills, softSkills);
      setMessage("Compétences mises à jour, matching recalculé.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setSaving(true);
    try {
      await documentsApi.upload(uploadType, uploadFile);
      setUploadFile(null);
      load();
      setMessage("Document ajouté.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
      {message && <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg">{message}</div>}

      <div className="card space-y-4">
        <h2 className="font-bold text-gray-900">Informations personnelles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input className="input" value={laureat.nom || ""} onChange={set("nom")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input className="input" value={laureat.prenom || ""} onChange={set("prenom")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input className="input" value={laureat.telephone || ""} onChange={set("telephone")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <input className="input" value={laureat.localisation || ""} onChange={set("localisation")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filière</label>
            <input className="input" value={laureat.filiere || ""} onChange={set("filiere")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de formation</label>
            <input className="input" value={laureat.niveau_formation || ""} onChange={set("niveau_formation")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
            <input className="input" value={laureat.disponibilite || ""} onChange={set("disponibilite")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input className="input" value={laureat.linkedin || ""} onChange={set("linkedin")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Expériences</label>
            <textarea rows={3} className="input" value={laureat.experiences || ""} onChange={set("experiences")} />
          </div>
        </div>
        <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
          Enregistrer
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-gray-900">Compétences</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Techniques</label>
          <SkillPicker selected={techSkills} onChange={setTechSkills} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Soft skills</label>
          <SkillPicker selected={softSkills} onChange={setSoftSkills} />
        </div>
        <button onClick={handleSaveSkills} disabled={saving} className="btn-primary">
          Enregistrer les compétences
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="font-bold text-gray-900">Documents</h2>
        <ul className="space-y-2">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between text-sm border border-gray-100 rounded-lg px-3 py-2">
              <span className="flex items-center gap-2 text-gray-700">
                <FileText size={16} className="text-primary" /> {d.nom_fichier}
                <span className="badge bg-gray-100 text-gray-500">{d.type}</span>
              </span>
              <button onClick={() => documentsApi.download(d.id, d.nom_fichier)} className="text-primary hover:underline flex items-center gap-1">
                <Download size={14} /> Télécharger
              </button>
            </li>
          ))}
          {documents.length === 0 && <p className="text-sm text-gray-400">Aucun document ajouté.</p>}
        </ul>

        <div className="flex gap-2 items-end pt-2 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select className="input" value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="input"
            />
          </div>
          <button onClick={handleUpload} disabled={!uploadFile || saving} className="btn-primary">
            Ajouter
          </button>
        </div>

        {laureat.cv_analyse_statut === "echec" && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm p-3 rounded-lg">
            <AlertTriangle size={16} />
            L&apos;analyse automatique de votre CV a échoué. Vos compétences et expériences ci-dessus restent
            à compléter manuellement.
          </div>
        )}
      </div>

      {cvAnalyse && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> Analyse automatique du CV
          </h2>
          <p className="text-xs text-gray-400 -mt-2">
            Détecté automatiquement à partir de votre CV. Vos compétences ont déjà été ajoutées ci-dessus ;
            vérifiez et corrigez si besoin.
          </p>

          {cvAnalyse.competences.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Compétences détectées</p>
              <div className="flex flex-wrap gap-1">
                {cvAnalyse.competences.map((c) => (
                  <span key={c} className="badge bg-blue-50 text-blue-700 text-xs">{c}</span>
                ))}
              </div>
            </div>
          )}

          {cvAnalyse.experiences.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Expériences détectées</p>
              <ul className="space-y-1 text-sm text-gray-600">
                {cvAnalyse.experiences.map((e, i) => (
                  <li key={i}>
                    <span className="font-medium text-gray-800">{e.poste}</span> — {e.entreprise} ({e.periode})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cvAnalyse.formations.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Formations détectées</p>
              <ul className="space-y-1 text-sm text-gray-600">
                {cvAnalyse.formations.map((f, i) => (
                  <li key={i}>{f.diplome} — {f.etablissement} ({f.annee})</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
