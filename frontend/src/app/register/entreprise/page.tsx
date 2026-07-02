"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { authApi } from "@/services/api";
import { storeSession } from "@/lib/auth";

export default function RegisterEntreprisePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    raison_sociale: "",
    secteur: "",
    email: "",
    password: "",
    contact_nom: "",
    contact_telephone: "",
    ville: "",
    site_web: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.registerEntreprise(form);
      storeSession(res.data.access_token, res.data.user);
      router.push("/entreprise/offres");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <section className="bg-cmc-sky py-16">
        <div className="max-w-xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Inscription Entreprise</h1>
            <p className="text-gray-500 text-sm mb-6">
              Votre compte sera examiné par le CMC avant de pouvoir publier des offres.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale *</label>
                  <input required className="input-cmc" value={form.raison_sociale} onChange={set("raison_sociale")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d&apos;activité *</label>
                  <input required className="input-cmc" value={form.secteur} onChange={set("secteur")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input className="input-cmc" value={form.ville} onChange={set("ville")} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
                  <input required type="email" className="input-cmc" value={form.email} onChange={set("email")} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input required type="password" minLength={6} className="input-cmc" value={form.password} onChange={set("password")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du contact</label>
                  <input className="input-cmc" value={form.contact_nom} onChange={set("contact_nom")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input className="input-cmc" value={form.contact_telephone} onChange={set("contact_telephone")} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
                  <input className="input-cmc" value={form.site_web} onChange={set("site_web")} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description de l&apos;entreprise</label>
                  <textarea rows={3} className="input-cmc" value={form.description} onChange={set("description")} />
                </div>
              </div>

              {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

              <button type="submit" disabled={loading} className="btn-cmc w-full">
                {loading ? "Création du compte..." : "Créer mon compte entreprise"}
              </button>
            </form>
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}
