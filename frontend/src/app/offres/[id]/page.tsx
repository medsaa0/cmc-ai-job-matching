"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { offresApi, candidaturesApi } from "@/services/api";
import { getStoredUser } from "@/lib/auth";
import type { Offre } from "@/types";

export default function OffreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [offre, setOffre] = useState<Offre | null>(null);
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    offresApi.get(id).then((r) => setOffre(r.data)).catch(() => {});
  }, [id]);

  const handlePostuler = async () => {
    const user = getStoredUser();
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "laureat") {
      setMessage("Seuls les comptes lauréat peuvent postuler.");
      return;
    }
    try {
      await candidaturesApi.postuler(id);
      setApplied(true);
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || "Une erreur est survenue.");
    }
  };

  if (!offre) {
    return (
      <>
        <PublicHeader />
        <p className="text-center text-gray-400 py-20">Chargement...</p>
        <PublicFooter />
      </>
    );
  }

  const competences = offre.competences_requises ? offre.competences_requises.split("|") : [];

  return (
    <>
      <PublicHeader />
      <section className="bg-cmc-hero py-14">
        <div className="max-w-4xl mx-auto px-6">
          <span className="badge bg-white/10 text-white">{offre.type_contrat}</span>
          <h1 className="text-3xl font-extrabold text-white mt-3">{offre.titre_poste}</h1>
          <p className="text-cmc-sky/70 mt-1">{offre.entreprise}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-2">Description du poste</h2>
            <p className="text-gray-600 text-sm whitespace-pre-line">{offre.description}</p>
          </div>
          {competences.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">Compétences requises</h2>
              <div className="flex flex-wrap gap-2">
                {competences.map((c) => (
                  <span key={c} className="badge bg-cmc-sky text-cmc-teal-dark">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card h-fit space-y-3">
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={16} className="text-cmc-teal" /> {offre.localisation}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase size={16} className="text-cmc-teal" /> {offre.domaine}
          </p>
          {offre.niveau_formation_requis && (
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <GraduationCap size={16} className="text-cmc-teal" /> {offre.niveau_formation_requis}
            </p>
          )}

          {applied ? (
            <p className="flex items-center gap-2 text-emerald-600 text-sm font-semibold pt-2">
              <CheckCircle2 size={18} /> Candidature envoyée
            </p>
          ) : (
            <button onClick={handlePostuler} className="btn-cmc w-full mt-2">
              Postuler à cette offre
            </button>
          )}
          {message && <p className="text-xs text-cmc-crimson">{message}</p>}
        </div>
      </section>
      <PublicFooter />
    </>
  );
}
