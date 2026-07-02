"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi } from "@/services/api";
import { DashboardStats } from "@/types";
import StatCard from "@/components/StatCard";
import { Users, Briefcase, BookOpen, Award, GitMerge, Bell, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#1e40af", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#be185d", "#059669"];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    dashboardApi.stats().then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-64 text-blue-700 font-semibold">Chargement...</div>;
  if (!stats) return null;

  const domainData = Object.entries(stats.offres_par_domaine)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.split(" ")[0], value }));

  const decisionData = Object.entries(stats.decisions_count).map(([name, value]) => ({ name, value }));
  const topComps = stats.top_competences_demandees.slice(0, 8).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm">Vue globale de la plateforme CMC Matching IA</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Lauréats" value={stats.nb_laureats} icon={Users} color="blue" />
        <StatCard title="Offres" value={stats.nb_offres} icon={Briefcase} color="green" />
        <StatCard title="Filières" value={stats.nb_filieres} icon={BookOpen} color="purple" />
        <StatCard title="Compétences" value={stats.nb_competences} icon={Award} color="teal" />
        <StatCard title="Matchings" value={stats.nb_matchings} icon={GitMerge} color="orange" />
        <StatCard title="Score moyen" value={`${stats.score_moyen}%`} icon={TrendingUp} color="blue" />
        <StatCard title="Notifications" value={stats.notifications_attente} icon={Bell} color="orange" subtitle="En attente" />
        <StatCard title="Envoyées" value={stats.notifications_envoyees} icon={Bell} color="green" subtitle="Notifications" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Top compétences demandées</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topComps} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1e40af" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Offres par domaine</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={domainData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {domainData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Résultats de matching</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={decisionData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">Top filières (lauréats)</h2>
          <div className="space-y-2">
            {Object.entries(stats.laureats_par_filiere)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([filiere, count]) => (
                <div key={filiere} className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-gray-700 truncate">{filiere}</div>
                  <div className="w-24 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (count / stats.nb_laureats) * 100 * 3)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-6">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
