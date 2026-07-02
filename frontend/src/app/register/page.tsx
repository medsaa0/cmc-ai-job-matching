import Link from "next/link";
import { GraduationCap, Building2 } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export default function RegisterChoicePage() {
  return (
    <>
      <PublicHeader />
      <section className="bg-cmc-sky min-h-[70vh] flex items-center py-16">
        <div className="max-w-4xl mx-auto px-6 w-full">
          <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Créer un compte</h1>
          <p className="text-gray-500 text-center mb-10">Choisissez le type de compte adapté à votre profil</p>

          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/register/laureat"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-8 text-center"
            >
              <span className="w-16 h-16 rounded-2xl bg-cmc-sky flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-cmc-teal" size={30} />
              </span>
              <h2 className="font-bold text-xl text-gray-900 mb-2">Je suis Lauréat(e)</h2>
              <p className="text-gray-500 text-sm">
                Créez votre profil, ajoutez votre CV et vos compétences, et accédez aux offres qui vous
                correspondent.
              </p>
            </Link>

            <Link
              href="/register/entreprise"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-8 text-center"
            >
              <span className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Building2 className="text-cmc-crimson" size={30} />
              </span>
              <h2 className="font-bold text-xl text-gray-900 mb-2">Je suis une Entreprise</h2>
              <p className="text-gray-500 text-sm">
                Publiez vos offres de stage, PFE ou emploi et trouvez les lauréats les plus compatibles.
              </p>
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-cmc-teal-dark font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}
