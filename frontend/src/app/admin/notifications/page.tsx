"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notificationsApi } from "@/services/api";
import { Notification } from "@/types";
import { Bell, CheckCircle, Clock, RefreshCw, Zap } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    load();
  }, []);

  const load = () => {
    setLoading(true);
    notificationsApi.list({ statut: statut || undefined, limit: 200 })
      .then((r) => setNotifs(r.data))
      .finally(() => setLoading(false));
  };

  const generate = async () => {
    try {
      const res = await notificationsApi.generate();
      setMsg(res.data.message);
      load();
    } catch (e: any) {
      setMsg(e.response?.data?.detail || "Erreur");
    }
  };

  const markSent = async (id: number) => {
    await notificationsApi.markSent(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, statut: "Envoyée" } : n));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm">{notifs.length} notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-2"><RefreshCw size={16} />Actualiser</button>
          <button onClick={generate} className="btn-primary flex items-center gap-2"><Zap size={16} />Générer notifications</button>
        </div>
      </div>

      {msg && <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg border border-blue-200">{msg}</div>}

      <div className="card flex gap-3">
        <select className="input w-44" value={statut} onChange={(e) => { setStatut(e.target.value); }}>
          <option value="">Toutes</option>
          <option value="En attente">En attente</option>
          <option value="Envoyée">Envoyée</option>
        </select>
        <button className="btn-primary" onClick={load}>Filtrer</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-blue-700">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div key={n.id} className={`card flex items-start gap-4 ${n.statut === "Envoyée" ? "opacity-70" : ""}`}>
              <div className={`mt-0.5 flex-shrink-0 ${n.statut === "Envoyée" ? "text-green-500" : "text-orange-500"}`}>
                {n.statut === "Envoyée" ? <CheckCircle size={20} /> : <Clock size={20} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-800">{n.id_laureat}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-700">{n.id_offre}</span>
                  <span className={`badge ${n.statut === "Envoyée" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {n.statut}
                  </span>
                  <span className="badge bg-blue-100 text-blue-700">{n.type_notification}</span>
                </div>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.date_envoi).toLocaleString("fr-FR")}</p>
              </div>
              {n.statut === "En attente" && (
                <button
                  onClick={() => markSent(n.id)}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap flex-shrink-0"
                >
                  Marquer envoyée
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
