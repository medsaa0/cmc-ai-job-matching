"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { matchingApi } from "@/services/api";
import type { Questionnaire, QuestionnaireQuestion, MatchingResult } from "@/types";

const DIMENSION_LABELS: Record<string, string> = {
  competences: "Compétences techniques",
  experience: "Expérience",
  domaine: "Domaine visé",
  mobilite: "Mobilité & localisation",
  disponibilite: "Disponibilité",
  soft_skills: "Soft skills",
};

function groupByDimension(questions: QuestionnaireQuestion[]) {
  const order: string[] = [];
  const groups: Record<string, QuestionnaireQuestion[]> = {};
  for (const q of questions) {
    if (!groups[q.dimension]) {
      groups[q.dimension] = [];
      order.push(q.dimension);
    }
    groups[q.dimension].push(q);
  }
  return order.map((dimension) => ({ dimension, questions: groups[dimension] }));
}

export default function CandidatMatchingPage() {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [topOffres, setTopOffres] = useState<MatchingResult[]>([]);

  useEffect(() => {
    matchingApi.questionnaire().then((r) => setQuestionnaire(r.data)).finally(() => setLoading(false));
  }, []);

  const steps = useMemo(
    () => (questionnaire ? groupByDimension(questionnaire.questions) : []),
    [questionnaire]
  );

  if (loading) return <p className="text-gray-400">Chargement...</p>;
  if (!questionnaire || steps.length === 0) return <p className="text-gray-400">Questionnaire indisponible.</p>;

  const setAnswer = (id: string, value: unknown) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const toggleMulti = (id: string, value: string) => {
    const current = (answers[id] as string[]) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setAnswer(id, next);
  };

  const currentStep = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await matchingApi.submitReponses(answers);
      const idLaureat = (res.data as { id_laureat: string }).id_laureat;
      const top = await matchingApi.topOffres(idLaureat, 10);
      setTopOffres(top.data);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (q: QuestionnaireQuestion) => {
    const value = answers[q.id];
    switch (q.type) {
      case "echelle_1_5":
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setAnswer(q.id, n)}
                className={`w-11 h-11 rounded-full font-bold text-sm transition-colors ${
                  value === n ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        );
      case "booleen":
        return (
          <div className="flex gap-2">
            {[{ label: "Oui", v: true }, { label: "Non", v: false }].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setAnswer(q.id, opt.v)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  value === opt.v ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      case "single_choice":
        return (
          <div className="flex flex-wrap gap-2">
            {(q.options as string[])?.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswer(q.id, opt)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  value === opt ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      case "multi_choice": {
        const options = q.options as (string | { id_competence: string; competence: string })[] | undefined;
        const selected = (value as string[]) || [];
        return (
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {options?.map((opt) => {
              const label = typeof opt === "string" ? opt : opt.competence;
              const isSelected = selected.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleMulti(q.id, label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        );
      }
      default:
        return (
          <input
            className="input"
            value={(value as string) || ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
          />
        );
    }
  };

  if (done) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="card flex items-center gap-3 bg-emerald-50 border-emerald-100">
          <CheckCircle2 className="text-emerald-600" size={28} />
          <div>
            <p className="font-bold text-emerald-800">Questionnaire enregistré</p>
            <p className="text-sm text-emerald-700">Votre score de matching a été recalculé avec vos réponses.</p>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-900 mb-3">Vos offres recommandées mises à jour</h2>
          <div className="space-y-2">
            {topOffres.map((r) => (
              <div key={r.id_offre} className="card flex items-center justify-between">
                <span className="text-gray-700">{r.id_offre}</span>
                <span className="text-sm font-bold text-cmc-teal-dark">
                  {Math.round(r.score_final)}% — {r.decision}
                </span>
              </div>
            ))}
            {topOffres.length === 0 && <p className="text-gray-400 text-sm">Aucune offre pour le moment.</p>}
          </div>
        </div>

        <Link href="/candidat/offres" className="btn-primary inline-block">
          Voir toutes mes offres recommandées
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Questionnaire de matching</h1>
        <p className="text-gray-500 text-sm">
          Répondez à ces questions pour affiner votre score de compatibilité avec les offres.
        </p>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-gray-400">Étape {step + 1} / {steps.length}</p>

      <div className="card space-y-6">
        <h2 className="font-bold text-gray-900">{DIMENSION_LABELS[currentStep.dimension] || currentStep.dimension}</h2>
        {currentStep.questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{q.intitule}</label>
            {renderQuestion(q)}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-secondary flex items-center gap-1 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Précédent
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            className="btn-primary flex items-center gap-1"
          >
            Suivant <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary">
            {submitting ? "Envoi..." : "Valider et voir mon score"}
          </button>
        )}
      </div>
    </div>
  );
}
