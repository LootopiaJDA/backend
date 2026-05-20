# 🚀 Guide de Démarrage — Lootopia Backend

> Projet d'études M1 DEVA 2025/2026 — SUP DE VINCI  
> Équipe : Jimmy (Backend) · Damien (Frontend) · Alexandre (Gestion de projet)

---

## Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| **Node.js** | >= 20.x | `node -v` |
| **npm** | >= 9.x | `npm -v` |
| **Docker** | >= 24.x | `docker -v` |
| **Docker Compose** | v2+ | `docker compose version` |
| **Git** | — | `git --version` |

> PostgreSQL n'est **pas** à installer manuellement — Docker Compose le gère.

---

## Installation locale

### 1. Cloner le repository

```bash
git clone <repo-url>
cd lootopiajda-backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Renseigner le fichier `.env` :

```env
# Base de données (Docker Compose)
DATABASE_URL=postgresql://admin:admin@localhost:5432/lootopia
DATABASE_URL_DOCKER=postgresql://admin:admin@postgres:5432/lootopia

# PostgreSQL (Docker)
POSTGRES_DB=lootopia
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin

# pgAdmin (Docker)
PG_ADMIN_EMAIL=admin@admin.com
PG_ADMIN_PASSWORD=admin

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_prod

# Chiffrement AES-256
ENCRYPTION_PASSWORD=your_encryption_password_32chars

# Cloudinary (stockage images)
API_KEY_CLOUDINARY=your_cloudinary_api_key
API_KEY_CLOUDINARY_SECRET=your_cloudinary_secret

# Environnement
NODE_ENV=development
PORT=3000
```

> ⚠️ Ne jamais versionner le fichier `.env`. Il est dans le `.gitignore`.

### 4. Démarrer les services Docker

```bash
docker compose up -d
```

Lance automatiquement :
- **PostgreSQL 15** → port `5432`
- **pgAdmin 4** → port `5050` (http://localhost:5050)

Attendre que PostgreSQL soit `healthy` avant de continuer :

```bash
docker compose ps   # vérifier le statut "healthy" du service postgres
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma (src/generated/prisma/)
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate
```

### 6. Lancer le serveur

```bash
# Mode développement (hot reload)
npm run start:dev
```

Sortie attendue :

```
🚀 Lootopia Backend is running!

👉 API:          http://localhost:3000
👉 Swagger:      http://localhost:3000/api
👉 PgAdmin:      http://localhost:5050
👉 PostgreSQL:   postgresql://admin:admin@localhost:5432/lootopia
```

---

## Commandes utiles

### Développement

```bash
npm run start:dev       # Démarrage avec hot reload
npm run start:debug     # Mode debug
npm run build           # Compilation TypeScript
npm run start:prod      # Démarrage en production (après build)
```

### Base de données

```bash
npm run prisma:generate           # Régénérer le client Prisma
npm run prisma:migrate            # Créer + appliquer une migration (dev)
npm run prisma:migrate deploy     # Appliquer les migrations (prod)
npm run studio                    # Prisma Studio → http://localhost:5555
```

### Tests

```bash
npm run test            # Tests unitaires (Jest)
npm run test:watch      # Tests en mode watch
npm run test:cov        # Couverture de code
npm run test:e2e        # Tests end-to-end
```

### Qualité de code

```bash
npm run lint            # Analyse ESLint
npm run lint:fix        # Correction automatique ESLint
npm run format          # Formatage Prettier
```

---

## Test rapide de l'API

### Créer un utilisateur

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "Password123!"}'
```

### Se connecter

```bash
curl -X POST http://localhost:3000/connexion \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "test@example.com", "password": "Password123!"}'
```

Le cookie JWT `access_token` est automatiquement stocké dans `cookies.txt`.

### Consulter les chasses disponibles

```bash
curl -X GET http://localhost:3000/chasse \
  -b cookies.txt
```

---

## Déploiement Production (Azure)

### Infrastructure

| Service | Port | Description |
|---|---|---|
| Backend API | 3000 | NestJS — http://20.46.53.133:3000 |
| PostgreSQL | 5432 | Base de données (interne) |
| pgAdmin | 5050 | Interface admin BD (interne) |

### Pipeline CI/CD (GitHub Actions)

Le déploiement est **entièrement automatique** sur push vers `main`.

**CI** (`.github/workflows/ci.yml`) — sur push/PR vers `main` et `develop` :
```
checkout → npm ci → prisma generate → npm test → docker build → eslint
```

**CD** (`.github/workflows/azure-webapps-node.yml`) — sur push vers `main` :
```
build image → push ghcr.io → SSH Azure VM → docker compose pull → up -d → prisma migrate deploy
```

### Secrets GitHub requis

| Secret | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL production |
| `JWT_SECRET` | Clé secrète JWT production |
| `ENCRYPTION_PASSWORD` | Clé AES-256 production |
| `VM_HOST` | IP de la VM Azure (20.46.53.133) |
| `VM_USERNAME` | Utilisateur SSH Azure (azureuser) |
| `VM_SSH_PRIVATE_KEY` | Clé privée SSH pour le déploiement |

### Déploiement manuel (si besoin)

```bash
# Sur la VM Azure
ssh azureuser@20.46.53.133

# Tirer la dernière image et redémarrer
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d

# Appliquer les migrations
docker exec lootopia-backend npx prisma migrate deploy
```

---

## Troubleshooting

### PostgreSQL ne démarre pas

```bash
docker compose logs postgres   # Voir les logs
docker compose down -v         # Supprimer les volumes et recommencer
docker compose up -d
```

### Erreur "Prisma Client not generated"

```bash
npm run prisma:generate
```

### Port 3000 déjà utilisé

```bash
# Trouver et stopper le processus
lsof -i :3000
kill -9 <PID>
```

### Variables d'environnement non chargées

Vérifier que le fichier `.env` est bien à la racine du projet et relancer :
```bash
npm run start:dev
```

---

*SUP DE VINCI — M1 DEVA — 2025/2026 — Jimmy · Damien · Alexandre*
