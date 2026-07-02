export default function PublicFooter() {
  return (
    <footer className="bg-cmc-navy text-cmc-sky/70 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} CMC Connect — Cité des Métiers et des Compétences de l&apos;Oriental</p>
        <p className="text-cmc-sky/50">Plateforme officielle emploi, stages et PFE</p>
      </div>
    </footer>
  );
}
