"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Users, GraduationCap, Building2, Briefcase,
  Search, UserPlus, Send, Trophy,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import OffreCard from "@/components/OffreCard";
import { dashboardApi, offresApi } from "@/services/api";
import type { Offre } from "@/types";

const HOW_IT_WORKS = [
  { icon: UserPlus, title: "Créez votre profil", desc: "Inscrivez-vous et complétez votre profil en quelques minutes." },
  { icon: Search, title: "Explorez les offres", desc: "Parcourez les offres adaptées à votre filière." },
  { icon: Send, title: "Postulez en ligne", desc: "Envoyez votre candidature directement depuis la plateforme." },
  { icon: Trophy, title: "Décrochez votre poste", desc: "Soyez contacté(e) par l'entreprise et lancez votre carrière." },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ nb_laureats: 0, nb_entreprises: 0, nb_offres_actives: 0 });
  const [offres, setOffres] = useState<Offre[]>([]);

  useEffect(() => {
    dashboardApi.publicStats().then((r) => setStats(r.data)).catch(() => {});
    offresApi.list({ limit: 3, statut: "Active" }).then((r) => setOffres(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <PublicHeader />

      {/* Hero */}
      <section className="bg-cmc-hero relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-20 relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="pill bg-white/10 text-cmc-teal border border-white/10 inline-flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Plateforme officielle du CMC Connect
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white mb-6">
              Trouvez Votre{" "}
              <span className="bg-gradient-to-r from-cmc-teal to-pink-300 bg-clip-text text-transparent">
                Avenir Professionnel
              </span>{" "}
              Au Maroc
            </h1>
            <p className="text-cmc-sky/80 text-lg mb-8 max-w-lg">
              Accédez aux meilleures opportunités de stage, PFE et emploi proposées
              par nos entreprises partenaires.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/offres" className="btn-cmc inline-flex items-center gap-2">
                Explorer les Offres <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn-cmc-outline">
                Créer mon profil
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6">
              <p className="flex items-center gap-2 text-white text-sm font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Offres Récentes
              </p>
              <div className="space-y-3">
                {(offres.length ? offres : [null, null, null]).slice(0, 3).map((o, i) => (
                  <div key={o?.id_offre ?? i} className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-lg bg-cmc-teal flex items-center justify-center text-white font-bold flex-shrink-0">
                      {o?.entreprise?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {o?.titre_poste ?? "Chargement..."}
                      </p>
                      <p className="text-cmc-sky/60 text-xs">{o?.type_contrat ?? ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <span className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ✓ 89% Taux d&apos;insertion
            </span>
            <span className="absolute -bottom-4 -left-4 bg-cmc-crimson text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {stats.nb_entreprises || 140}+ Entreprises
            </span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 text-center">
          {[
            { icon: Users, value: `${stats.nb_laureats || 500}+`, label: "Stagiaires Formés" },
            { icon: GraduationCap, value: `${stats.nb_laureats || 300}+`, label: "Lauréats Diplômés" },
            { icon: Building2, value: `${stats.nb_entreprises || 140}+`, label: "Entreprises Partenaires" },
            { icon: Briefcase, value: `${stats.nb_offres_actives || 250}+`, label: "Offres Actives" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="px-2">
              <span className="w-12 h-12 rounded-xl bg-cmc-sky flex items-center justify-center mx-auto mb-3">
                <Icon className="text-cmc-teal" size={22} />
              </span>
              <p className="text-3xl font-extrabold text-gray-900">{value}</p>
              <p className="text-cmc-teal-dark text-sm font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest offers */}
      <section className="bg-cmc-sky py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="pill mb-4">OPPORTUNITÉS</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
            Dernières Offres Publiées
          </h2>
          <div className="w-14 h-1 bg-cmc-crimson mx-auto my-4 rounded-full" />
          <p className="text-gray-500 mb-10">Découvrez les opportunités disponibles</p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {offres.map((o) => (
              <OffreCard key={o.id_offre} offre={o} />
            ))}
          </div>

          <Link
            href="/offres"
            className="inline-flex items-center gap-2 mt-10 border border-cmc-teal text-cmc-teal-dark hover:bg-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Voir toutes les offres <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="a-propos" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="pill bg-pink-50 text-cmc-crimson">PROCESSUS</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-3">
            Comment ça marche ?
          </h2>
          <div className="w-14 h-1 bg-cmc-crimson mx-auto my-4 rounded-full" />

          <div className="grid md:grid-cols-4 gap-8 mt-12 relative">
            {HOW_IT_WORKS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative">
                <div className="relative inline-block mb-4">
                  <span className="w-14 h-14 rounded-xl bg-cmc-sky flex items-center justify-center mx-auto">
                    <Icon className="text-cmc-teal" size={24} />
                  </span>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cmc-crimson text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
