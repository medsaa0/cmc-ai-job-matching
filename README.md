# CMC Connect — Plateforme IA de Matching Emploi

Plateforme intelligente de matching emploi pour la Cité des Métiers et des Compétences (CMC) de l'Oriental, avec trois espaces (Administration CMC, Entreprises, Lauréats) et un moteur de matching basé sur l'IA.

## Objectif

Permettre au CMC de centraliser les profils de ses lauréats et les offres des entreprises partenaires, et calculer automatiquement un score de compatibilité entre chaque lauréat et chaque offre grâce à un moteur combinant TF-IDF et des règles métier.

---

## Fonctionnalités

- **Lauréats** : inscription en ligne (profil, diplôme, filière, compétences), upload de CV et documents (extraction du texte + **analyse structurée automatique par IA** — compétences, expériences, formations, voir [Analyse du CV](#analyse-du-cv-par-ia)), consultation des offres **de leur domaine uniquement** classées par score de compatibilité, questionnaire guidé pour affiner leur score, candidature en ligne, suivi des candidatures.
- **Entreprises** : inscription en ligne (validée par le CMC avant publication), dépôt d'offres via un formulaire guidé (poste, diplôme/filière requis, compétences avec niveau d'importance), **vue classée et filtrable des candidats ayant postulé** (score détaillé, compétences communes/manquantes, changement de statut), export CSV du classement.
- **Administration CMC** : validation des comptes entreprises, création d'offres au nom du CMC, gestion des lauréats/offres/filières/compétences, import CSV en masse, export CSV, tableau de bord avec statistiques complètes (candidatures par offre/entreprise, taux de conversion) et pages de détail (drill-down offre/lauréat/entreprise).
- **Moteur de matching** : score pondéré (compétences, similarité CV/offre par TF-IDF, **compatibilité de domaine/filière**, localisation, expérience, disponibilité, **questionnaire**), calculé automatiquement à chaque création/mise à jour de profil ou d'offre, et disponible dans les deux sens (offres → lauréat, lauréats → offre). Voir [Moteur de matching](#moteur-de-matching).
- **Frontend public** : page d'accueil et liste d'offres consultables sans connexion.

---

## Architecture

```
cmc-ai-job-matching/
├── backend/                  # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── main.py           # Entrée de l'application
│   │   ├── core/              # Config, DB, Sécurité JWT
│   │   ├── models/            # SQLAlchemy ORM (User, Laureat, Entreprise, Offre,
│   │   │                        Document, Candidature, MatchingResult, ...)
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── routers/           # Endpoints REST (auth, laureats, entreprises,
│   │   │                        offres, documents, candidatures, matching, export...)
│   │   ├── services/          # Logique métier (matching, import CSV, notifications)
│   │   ├── utils/             # Nettoyage texte, scoring
│   │   └── data/raw/          # Fichiers CSV sources pour l'import
│   ├── alembic/               # Migrations de base de données
│   ├── storage/uploads/       # CV et documents uploadés par les lauréats
│   └── requirements.txt
├── frontend/                  # Next.js 14 + TypeScript + Tailwind CSS
│   └── src/
│       ├── app/
│       │   ├── (accueil, offres, login, register)   # Pages publiques
│       │   ├── admin/                                # Espace Administration CMC
│       │   ├── candidat/                             # Espace Lauréat
│       │   └── entreprise/                           # Espace Entreprise
│       ├── components/        # Sidebar, PublicHeader, OffreCard, SkillPicker...
│       ├── services/          # Client API (Axios)
│       ├── lib/                # Auth, garde de rôle
│       └── types/              # Interfaces TypeScript
└── docker-compose.yml
```

---

## Technologies

| Couche | Technologies |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0, Alembic, Pandas, scikit-learn, pypdf |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, Axios |
| Base de données | PostgreSQL 15/16 |
| Déploiement | Docker, Docker Compose |
| Auth | JWT (python-jose + bcrypt) |
| IA | TF-IDF (scikit-learn) + règles métier pondérées |

---

## Lancement avec Docker

```bash
# 1. Cloner le projet
git clone https://github.com/medsaa0/cmc-ai-job-matching.git
cd cmc-ai-job-matching

# 2. Copier la config
cp .env.example .env

# 3. Lancer tout
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

---

## Lancement sans Docker (développement)

### Backend
```bash
cd backend
pip install -r requirements.txt
# Configurer DATABASE_URL dans .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

---

## Comptes de test

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Lauréat | laureat@example.com | laureat123 |

Les comptes **Entreprise** se créent via `/register/entreprise` puis doivent être validés par un administrateur dans `/admin/entreprises`.

---

## Import des données CSV (jeu de données initial)

Les fichiers CSV doivent être placés dans `backend/app/data/raw/` avec :
- Séparateur de colonnes : `;`
- Séparateur de listes : `|`

### Via l'interface web
Espace Admin → **Import CSV** → cliquer "Tout importer"

### Via l'API (Swagger)
```
POST /api/import/all
Authorization: Bearer <token_admin>
```

---

## Moteur de matching

### Filtrage par domaine (obligatoire)

Avant tout calcul de score, `run_matching` vérifie la compatibilité de domaine entre le lauréat (déduit de sa filière via la table `filieres`) et l'offre (`Offre.domaine` / `Offre.filiere_requise`), avec une table de synonymes extensible (`backend/app/utils/domaine_matching.py`). En mode par défaut (`MATCHING_DOMAINE_MODE=hard`), **aucun `MatchingResult` n'est créé** pour une paire hors-domaine (ex. un lauréat "Développement Digital" ne reçoit jamais d'offre "Santé"). Si la filière du lauréat ou le domaine de l'offre est inconnu, le matching n'est jamais bloqué : un score neutre (`score_domaine = 50`) est appliqué et un warning est loggé.

### Questionnaire de matching (optionnel, affine le score)

Un lauréat peut remplir un questionnaire guidé (`GET /api/matching/questionnaire`, réponses via `POST /api/matching/questionnaire/reponses`) qui :
- confirme ses compétences réellement maîtrisées et son niveau auto-évalué (1-5) → ajuste `score_competences` d'un facteur 0.85 à 1.15
- met à jour son profil (mobilité, disponibilité, expérience terrain) → ces champs sont relus directement par `score_localisation`, `score_disponibilite`, `score_experience`
- deux mises en situation soft skills (1-5) → alimentent `score_questionnaire`

Sans questionnaire rempli, tous ces signaux restent neutres (facteur `1.0`, `score_questionnaire = 50`) : le matching se comporte exactement comme avant, rétro-compatible.

### Formule du score final

```
score_final = 0.30 × score_competences     (recouvrement competences, ajuste par le questionnaire)
            + 0.15 × score_cv_offre        (similarite TF-IDF CV <-> offre)
            + 0.15 × score_domaine         (compatibilite domaine/filiere)
            + 0.15 × score_localisation    (ville / mobilite)
            + 0.10 × score_experience      (experience deduite du profil)
            + 0.05 × score_disponibilite   (delai de disponibilite)
            + 0.10 × score_questionnaire   (soft skills du questionnaire, neutre a 50 si non rempli)
```

| Score | Décision |
|---|---|
| ≥ 80 | Très recommandé |
| ≥ 65 | Recommandé |
| ≥ 50 | Moyen |
| < 50 | Non prioritaire |

Le score est recalculé automatiquement à chaque inscription/mise à jour de profil lauréat, à chaque création/modification d'offre, et à chaque soumission du questionnaire. Un recalcul global reste disponible depuis l'espace Admin (page **Matching**).

---

## Analyse du CV par IA

À l'upload d'un CV (PDF), le texte est d'abord extrait tel quel (`pypdf`) et stocké dans `Laureat.cv_text` — c'est ce texte brut qui alimente le score de similarité TF-IDF. En complément, si une clé Gemini est configurée, ce texte est envoyé à l'API Gemini (`backend/app/services/cv_analysis_service.py`) qui renvoie un JSON structuré : compétences, soft skills, langues, expériences (poste/entreprise/période), formations. Les compétences et expériences détectées sont **fusionnées automatiquement** dans le profil du lauréat (sans écraser ce qu'il a déjà renseigné), puis son matching est relancé.

**Configuration** (facultative, désactivée par défaut) :
1. Créer une clé gratuite sur https://aistudio.google.com/apikey
2. L'ajouter dans `.env` à la racine du projet : `GEMINI_API_KEY=votre_cle`
3. Relancer `docker compose up -d --build backend`

Sans clé configurée, l'extraction du texte brut continue de fonctionner normalement (rétro-compatible) ; `Laureat.cv_analyse_statut` vaut alors `"desactivee"`. En cas d'échec de l'appel API (quota, réseau, réponse invalide), le statut passe à `"echec"` et un avertissement est affiché au lauréat — l'upload du CV n'échoue jamais à cause de l'analyse IA. Le résultat détaillé (compétences/expériences/formations détectées) est visible sur la page **Mon profil** de l'espace Lauréat.

---

## Endpoints principaux

```
POST /api/auth/login
POST /api/auth/register/laureat
POST /api/auth/register/entreprise
GET  /api/auth/me

GET/PATCH /api/laureats/me
POST      /api/laureats/me/competences
GET       /api/laureats/
GET       /api/laureats/{id}

GET/PATCH /api/entreprises/me
GET       /api/entreprises/
PATCH     /api/entreprises/{id}/valider
PATCH     /api/entreprises/{id}/rejeter

GET  /api/offres/
POST /api/offres/                # entreprise validée
POST /api/offres/admin           # CMC
PATCH /api/offres/{id_offre}
GET  /api/offres/mine

POST /api/documents/upload
GET  /api/documents/me
GET  /api/documents/{id}/download

POST /api/candidatures/
GET  /api/candidatures/me
GET  /api/candidatures/offre/{id_offre}          # candidatures enrichies (profil + scores), filtres ?statut= ?decision= ?score_min=
GET  /api/candidatures/offre/{id_offre}/stats     # nb candidatures, repartition statut/decision, score moyen, top competences manquantes
PATCH /api/candidatures/{id}/statut

POST /api/matching/run
GET  /api/matching/results
GET  /api/matching/laureat/{id_laureat}
GET  /api/matching/offre/{id_offre}
GET  /api/matching/top-offres/{id_laureat}
GET  /api/matching/top-laureats/{id_offre}
GET  /api/matching/questionnaire                  # structure du questionnaire guide
POST /api/matching/questionnaire/reponses          # lauréat connecté : enregistre ses reponses + relance son matching

GET  /api/export/laureats.csv
GET  /api/export/offres.csv
GET  /api/export/matching/offre/{id_offre}.csv

GET  /api/dashboard/public-stats
GET  /api/dashboard/stats                          # inclut candidatures_par_offre, taux de conversion, etc.
GET  /api/dashboard/offre/{id_offre}/detail         # admin uniquement
GET  /api/dashboard/laureat/{id_laureat}/detail     # admin uniquement
GET  /api/dashboard/entreprise/{id}/detail          # admin uniquement

POST /api/import/all
```

Documentation interactive complète : http://localhost:8000/docs

---

## Structure des CSV d'import

### laureats.csv
`id_laureat;nom;prenom;email;telephone;niveau_formation;filiere;annee_promotion;competences_techniques;soft_skills;certifications;experiences;cv_text;localisation;mobilite;disponibilite;linkedin;github_portfolio;statut_profil`

### offres.csv
`id_offre;titre_poste;entreprise;domaine;localisation;type_contrat;niveau_experience;competences_requises;description;source;lien_offre;date_publication;statut_offre;score_min_notification`
