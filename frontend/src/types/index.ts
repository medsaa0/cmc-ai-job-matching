export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "laureat" | "entreprise";
  id_laureat: string | null;
  entreprise_id: number | null;
  created_at: string;
}

export interface Entreprise {
  id: number;
  raison_sociale: string;
  secteur: string;
  description: string | null;
  ville: string | null;
  site_web: string | null;
  logo_url: string | null;
  contact_nom: string | null;
  contact_telephone: string | null;
  statut_validation: "en_attente" | "validee" | "rejetee";
  created_at: string;
}

export interface DocumentItem {
  id: number;
  id_laureat: string;
  type: "CV" | "DIPLOME" | "CIN" | "LETTRE_MOTIVATION" | "AUTRE";
  nom_fichier: string;
  uploaded_at: string;
}

export interface Candidature {
  id: number;
  id_laureat: string;
  id_offre: string;
  statut: "en_attente" | "vue" | "acceptee" | "rejetee";
  match_score: number | null;
  applied_at: string;
}

export interface Filiere {
  id: number;
  id_filiere: string;
  niveau_formation: string;
  niveau_acces: string;
  nom_filiere: string;
  domaine: string;
  description: string;
  competences_cibles: string;
  types_postes: string;
}

export interface Competence {
  id: number;
  id_competence: string;
  competence: string;
  synonymes: string;
  categorie: string;
  domaine: string;
  poids: number;
  niveau_recommande: string;
}

export interface Laureat {
  id: number;
  id_laureat: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveau_formation: string;
  filiere: string;
  annee_promotion: number;
  competences_techniques: string;
  soft_skills: string;
  certifications: string;
  experiences: string;
  cv_text: string;
  localisation: string;
  mobilite: string;
  disponibilite: string;
  linkedin: string;
  github_portfolio: string;
  statut_profil: string;
}

export interface Offre {
  id: number;
  id_offre: string;
  titre_poste: string;
  entreprise: string;
  entreprise_id: number | null;
  domaine: string;
  localisation: string;
  type_contrat: string;
  niveau_experience: string;
  competences_requises: string;
  description: string;
  source: string;
  lien_offre: string;
  date_publication: string;
  statut_offre: string;
  score_min_notification: number;
  niveau_formation_requis: string | null;
  filiere_requise: string | null;
}

export interface CompetenceRequise {
  id_competence: number;
  importance: number;
  obligatoire: boolean;
}

export interface MatchingResult {
  id: number;
  id_laureat: string;
  id_offre: string;
  score_competences: number;
  score_cv_offre: number;
  score_domaine: number;
  score_localisation: number;
  score_experience: number;
  score_disponibilite: number;
  score_final: number;
  decision: string;
  competences_communes: string;
  competences_manquantes: string;
  date_matching: string;
}

export interface CandidatureEnrichie {
  candidature_id: number;
  statut: string;
  applied_at: string | null;

  id_laureat: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  filiere: string | null;
  niveau_formation: string | null;
  localisation: string | null;
  linkedin: string | null;
  github_portfolio: string | null;

  score_final: number | null;
  score_competences: number | null;
  score_cv_offre: number | null;
  score_localisation: number | null;
  score_domaine: number | null;
  decision: string | null;
  competences_communes: string[];
  competences_manquantes: string[];
}

export interface CandidatureOffreStats {
  nb_candidatures_total: number;
  par_statut: Record<string, number>;
  par_decision: Record<string, number>;
  score_moyen: number | null;
  top_competences_manquantes: [string, number][];
}

export interface QuestionnaireQuestion {
  id: string;
  dimension: string;
  intitule: string;
  type: "single_choice" | "multi_choice" | "echelle_1_5" | "booleen" | "texte";
  poids: number;
  aide?: string | null;
  options?: string[] | { id_competence: string; competence: string }[] | null;
}

export interface Questionnaire {
  version: number;
  questions: QuestionnaireQuestion[];
}

export interface Notification {
  id: number;
  id_laureat: string;
  id_offre: string;
  type_notification: string;
  message: string;
  statut: string;
  date_envoi: string;
}

export interface DashboardStats {
  nb_laureats: number;
  nb_offres: number;
  nb_filieres: number;
  nb_competences: number;
  nb_matchings: number;
  score_moyen: number;
  notifications_envoyees: number;
  notifications_attente: number;
  top_competences_demandees: [string, number][];
  top_competences_disponibles: [string, number][];
  offres_par_domaine: Record<string, number>;
  laureats_par_filiere: Record<string, number>;
  decisions_count: Record<string, number>;
  offres_par_statut: Record<string, number>;
  entreprises_par_statut_validation: Record<string, number>;
  nb_candidatures_total: number;
  candidatures_par_statut: Record<string, number>;
  candidatures_aujourd_hui: number;
  candidatures_cette_semaine: number;
  candidatures_par_offre: {
    id_offre: string;
    titre_poste: string;
    entreprise: string;
    nb_candidatures: number;
    score_moyen: number | null;
  }[];
  top_offres_demandees: DashboardStats["candidatures_par_offre"];
  candidatures_par_entreprise: Record<string, number>;
  offres_sans_candidature: { id_offre: string; titre_poste: string }[];
  taux_conversion_candidatures_par_offre: number;
  taux_laureats_ayant_postule: number;
}
