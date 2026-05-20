# 🎯 Lootopia - Backend API

> Plateforme de chasse au trésor géolocalisée — Projet d'études M1 DEVA 2025/2026 — SUP DE VINCI

**Équipe :** Jimmy (Backend & DevOps) · Damien (Frontend) · Alexandre (Gestion de projet)  
**Production :** http://20.46.53.133:3000  
**Swagger :** http://20.46.53.133:3000/api

---

## 📚 Documentation

| Fichier | Contenu |
|---|---|
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Vue d'ensemble, architecture, routes API, DTOs, flux de traitement |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diagrammes en couches, flux HTTP, cycle de vie d'une requête, JWT |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Installation locale, variables d'environnement, commandes, déploiement |

---

## 🚀 Démarrage rapide

```bash
# 1. Cloner le repo
git clone <repo-url>
cd lootopiajda-backend

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Renseigner DATABASE_URL, JWT_SECRET, ENCRYPTION_PASSWORD, clés Cloudinary

# 4. Démarrer PostgreSQL + pgAdmin via Docker
docker compose up -d

# 5. Appliquer les migrations Prisma
npm run prisma:generate
npm run prisma:migrate

# 6. Lancer le serveur
npm run start:dev
# → API disponible sur http://localhost:3000
# → Swagger sur http://localhost:3000/api
```

---

## 📋 Stack Technologique

| Technologie | Version | Rôle |
|---|---|---|
| **NestJS** | ^11.0.1 | Framework backend |
| **TypeScript** | ^5.7.3 | Langage |
| **PostgreSQL** | 15 | Base de données |
| **Prisma** | ^7.0.1 | ORM |
| **Express** | (inclus NestJS) | Serveur HTTP |
| **JWT** | ^11.0.2 | Authentification (cookies HttpOnly) |
| **Cloudinary** | ^2.8.0 | Stockage et CDN images |
| **Docker / Docker Compose** | — | Conteneurisation |
| **GitHub Actions** | — | CI/CD (CI: tests/lint/build, CD: push GHCR + deploy Azure) |
| **Azure VM** | Ubuntu | Hébergement production |

---

## 🏗️ Architecture (résumé)

```
CLIENT (React Native / Next.js)
        │  HTTP/REST
        ▼
NestJS (Controllers → Guards → Pipes → Services)
        │
        ▼
Prisma ORM → PostgreSQL 15 (Azure)
        │
     Cloudinary (images)
```

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour les diagrammes ASCII complets.

---

## 🔐 Authentification & Rôles

- **JWT** stocké en cookies **HttpOnly** (protection XSS)
- Expiration configurable via `JWT_SECRET`
- **RBAC** — 3 rôles :
  - `ADMIN` : supervision complète, validation des partenaires
  - `PARTENAIRE` : création et gestion de ses propres chasses
  - `JOUEUR` : participation aux chasses, validation des étapes

---

## 📡 Routes API principales

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/connexion` | Login → retourne cookie JWT |
| GET | `/connexion/logout` | Logout → supprime le cookie |

### Utilisateurs
| Méthode | Route | Rôle requis |
|---|---|---|
| POST | `/user` | Public |
| GET | `/user` | ADMIN |
| PATCH | `/user/:id` | ADMIN / Propriétaire |
| DELETE | `/user/:id` | ADMIN / Propriétaire |

### Chasses
| Méthode | Route | Rôle requis |
|---|---|---|
| GET | `/chasse` | Authentifié |
| POST | `/chasse` | PARTENAIRE |
| PATCH | `/chasse/:id` | PARTENAIRE (propriétaire) |
| DELETE | `/chasse/:id` | PARTENAIRE (propriétaire) |

### Étapes
| Méthode | Route | Rôle requis |
|---|---|---|
| POST | `/etape` | PARTENAIRE |
| PATCH | `/etape/:id/validateEtape` | JOUEUR |
| DELETE | `/etape/:id` | PARTENAIRE (propriétaire) |

### Score & Admin
| Méthode | Route | Rôle requis |
|---|---|---|
| GET | `/score/:chasseId` | Authentifié |
| GET | `/admin/partenaires` | ADMIN |
| PATCH | `/admin/valider/:id` | ADMIN |

---

## ☁️ Déploiement Production (Azure)

Le déploiement est **entièrement automatisé** via GitHub Actions :

1. **CI** (`ci.yml`) — déclenché sur push/PR vers `main` et `develop` :
   - `npm ci` → `prisma generate` → `npm test` → `docker build` → `eslint`

2. **CD** (`azure-webapps-node.yml`) — déclenché sur push vers `main` :
   - Build & push image Docker → **GitHub Container Registry (ghcr.io)**
   - Déploiement SSH sur VM Azure → `docker compose up -d`
   - Migrations automatiques → `prisma migrate deploy`

**URL production :** http://20.46.53.133:3000  
**Services actifs :** backend (3000), postgres (5432), pgadmin (5050)

---

## 🧪 Tests

```bash
npm run test          # Tests unitaires (Jest)
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Couverture de code
npm run lint          # ESLint
```

---

## 👥 Équipe projet

| Prénom | Rôle | Responsabilités |
|---|---|---|
| **Jimmy** | Backend & DevOps | NestJS, Prisma, PostgreSQL, Docker, CI/CD Azure |
| **Damien** | Frontend | React Native (mobile), Next.js (web) |
| **Alexandre** | Gestion de projet | Kanban, backlog, livrables, vidéo MVP |

---

*SUP DE VINCI — Mastère Développement Fullstack — M1 DEVA — 2025/2026*
