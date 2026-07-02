"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";
import { storeSession, dashboardPathForRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      storeSession(res.data.access_token, res.data.user);
      router.push(dashboardPathForRole(res.data.user.role));
    } catch {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cmc-hero flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex w-14 h-14 bg-cmc-teal rounded-2xl items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">CMC</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">CMC Connect</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-cmc"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-cmc"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-cmc w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-cmc-teal-dark font-semibold hover:underline">
            S&apos;inscrire
          </Link>
        </p>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700">Comptes de test :</p>
          <p>Admin : admin@example.com / admin123</p>
          <p>Lauréat : laureat@example.com / laureat123</p>
        </div>
      </div>
    </div>
  );
}
