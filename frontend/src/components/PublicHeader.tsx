"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { getStoredUser, dashboardPathForRole } from "@/lib/auth";
import type { User } from "@/types";

export default function PublicHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-cmc-teal flex items-center justify-center flex-shrink-0">
            <GraduationCap className="text-white" size={22} />
          </span>
          <span>
            <span className="block font-bold text-gray-900 leading-tight">CMC Connect</span>
            <span className="block text-xs text-gray-500 leading-tight">
              Cité des Métiers et des Compétences
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-cmc-teal-dark">Accueil</Link>
          <Link href="/offres" className="hover:text-cmc-teal-dark">Offres</Link>
          <Link href="/#a-propos" className="hover:text-cmc-teal-dark">À propos</Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href={dashboardPathForRole(user.role)} className="btn-cmc-crimson text-sm">
              Mon espace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="border border-cmc-teal text-cmc-teal-dark hover:bg-cmc-sky font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Se connecter
              </Link>
              <Link href="/register" className="btn-cmc-crimson text-sm">
                Espace Candidat
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
