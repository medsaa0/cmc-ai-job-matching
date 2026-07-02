# CMC Connect — Plateforme IA de Matching Emploi

Plateforme intelligente de matching emploi pour la Cité des Métiers et des Compétences (CMC) de l'Oriental, avec trois espaces (Administration CMC, Entreprises, Lauréats) et un moteur de matching basé sur l'IA.

## Objectif

Permettre au CMC de centraliser les profils de ses lauréats et les offres des entreprises partenaires, et calculer automatiquement un score de compatibilité entre chaque lauréat et chaque offre grâce à un moteur combinant TF-IDF et des règles métier.

---

## Fonctionnalités

- **Lauréats** : inscription en ligne (profil, diplôme, filière, compétences), upload de CV et documents (extraction automatique du texte du CV), consultation des offres classées par score de compatibilité, candidature en ligne, suivi des candidatures.
- **Entreprises** : inscription en ligne (validée par le CMC avant publication), dépôt d'offres via un formulaire guidé (poste, diplôme/filière requis, compétences avec niveau d'importance), consultation des lauréats les plus compatibles pour chaque offre, export CSV du classement.
- **Administration CMC** : validation des comptes entreprises, création d'offres au nom du CMC, gestion des lauréats/offres/filières/compétences, import CSV en masse, export CSV, tableau de bord avec statistiques.
- **Moteur de matching** : score pondéré (compétences, similarité CV/offre par TF-IDF, localisation, expérience, disponibilité), calculé automatiquement à chaque création/mise à jour de profil ou d'offre, et disponible dans les deux sens (offres → lauréat, lauréats → offre).
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

Le score final est calculé selon la formule :

```
score_final = 0.40 × score_compétences
            + 0.25 × score_cv_offre
            + 0.15 × score_localisation
            + 0.10 × score_expérience
            + 0.10 × score_disponibilité
```

| Score | Décision |
|---|---|
| ≥ 80 | Très recommandé |
| ≥ 65 | Recommandé |
| ≥ 50 | Moyen |
| < 50 | Non prioritaire |

Le score est recalculé automatiquement à chaque inscription/mise à jour de profil lauréat et à chaque création/modification d'offre. Un recalcul global reste disponible depuis l'espace Admin (page **Matching**).

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
GET  /api/candidatures/offre/{id_offre}
PATCH /api/candidatures/{id}/statut

POST /api/matching/run
GET  /api/matching/top-offres/{id_laureat}
GET  /api/matching/top-laureats/{id_offre}

GET  /api/export/laureats.csv
GET  /api/export/offres.csv
GET  /api/export/matching/offre/{id_offre}.csv

GET  /api/dashboard/public-stats
GET  /api/dashboard/stats

POST /api/import/all
```

Documentation interactive complète : http://localhost:8000/docs

---

## Structure des CSV d'import

### laureats.csv
`id_laureat;nom;prenom;email;telephone;niveau_formation;filiere;annee_promotion;competences_techniques;soft_skills;certifications;experiences;cv_text;localisation;mobilite;disponibilite;linkedin;github_portfolio;statut_profil`

### offres.csv
`id_offre;titre_poste;entreprise;domaine;localisation;type_contrat;niveau_experience;competences_requises;description;source;lien_offre;date_publication;statut_offre;score_min_notification`
