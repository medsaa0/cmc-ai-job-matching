"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase, GitMerge, Bell,
  BookOpen, Award, Upload, LogOut, UserCircle, FileCheck,
  Building2, PlusCircle, Download, ClipboardList,
} from "lucide-react";
import clsx from "clsx";
import { clearSession } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const NAV_BY_ROLE: Record<"admin" | "laureat" | "entreprise", NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/laureats", label: "Lauréats", icon: Users },
    { href: "/admin/offres", label: "Offres", icon: Briefcase },
    { href: "/admin/entreprises", label: "Entreprises", icon: Building2 },
    { href: "/admin/matching", label: "Matching", icon: GitMerge },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/filieres", label: "Filières", icon: BookOpen },
    { href: "/admin/competences", label: "Compétences", icon: Award },
    { href: "/admin/import", label: "Import CSV", icon: Upload },
    { href: "/admin/export", label: "Export CSV", icon: Download },
  ],
  laureat: [
    { href: "/candidat/offres", label: "Offres pour moi", icon: Briefcase },
    { href: "/candidat/candidatures", label: "Mes candidatures", icon: ClipboardList },
    { href: "/candidat/profil", label: "Mon profil", icon: UserCircle },
  ],
  entreprise: [
    { href: "/entreprise/offres", label: "Mes offres", icon: Briefcase },
    { href: "/entreprise/offres/nouvelle", label: "Nouvelle offre", icon: PlusCircle },
    { href: "/entreprise/profil", label: "Mon entreprise", icon: FileCheck },
  ],
};

const TITLE_BY_ROLE: Record<"admin" | "laureat" | "entreprise", { title: string; subtitle: string }> = {
  admin: { title: "CMC Connect", subtitle: "Espace Administration" },
  laureat: { title: "CMC Connect", subtitle: "Espace Lauréat" },
  entreprise: { title: "CMC Connect", subtitle: "Espace Entreprise" },
};

export default function Sidebar({ role }: { role: "admin" | "laureat" | "entreprise" }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = NAV_BY_ROLE[role];
  const { title, subtitle } = TITLE_BY_ROLE[role];

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col shadow-xl">
      <div className="px-6 py-5 border-b border-blue-800">
        <h1 className="text-lg font-bold leading-tight">{title}</h1>
        <p className="text-blue-300 text-xs mt-0.5">{subtitle}</p>
      </div>

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-blue-700 text-white"
                : "text-blue-200 hover:bg-blue-800 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-white w-full px-2 py-2 rounded transition-colors"
        >
          Voir le site public
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-white w-full px-2 py-2 rounded transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
