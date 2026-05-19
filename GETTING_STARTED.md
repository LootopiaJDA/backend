# 🚀 Guide de Démarrage - Lootopia Backend

## Prérequis

- **Node.js** : >= 18.x
- **npm** : >= 9.x
- **PostgreSQL** : >= 12
- **Docker** (optionnel, mais recommandé)
- **Git**

---

## Installation locale

### 1. Cloner le repository

```bash
git clone <repo-url>
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Database
DATABASE_URL=postgresql://admin:admin@localhost:5432/lootopia

# Cloudinary (Image Storage)
API_KEY_CLOUDINARY=your_api_key_here
API_KEY_CLOUDINARY_SECRET=your_secret_here

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_prod

# Environment
NODE_ENV=development
PORT=3000
```

### 4. Démarrer PostgreSQL

#### Option A : Avec Docker Compose

```bash
docker-compose up -d
```

Cela va démarrer :
- PostgreSQL (port 5432)
- PgAdmin (port 5050)
- Redis (optionnel)

**Pour accéder à PgAdmin** :
- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin

#### Option B : PostgreSQL local

```bash
# macOS
brew install postgresql
brew services start postgresql

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Télécharger depuis https://www.postgresql.org/download/windows/
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# (Optionnel) Seed des données de test
npm run prisma:seed
```

### 6. Démarrer le serveur

```bash
# Développement avec hot reload
npm run start:dev

# Production
npm run build
npm run start:prod
```

**Sortie attendue :**

```
-----------------------------------------------------
 🚀 Lootopia Backend is running!
 
 👉 API:             http://localhost:3000
 👉 Swagger:         http://localhost:3000/api
 👉 PgAdmin:         http://localhost:5050
 👉 PostgreSQL:      postgresql://admin:admin@localhost:5432/lootopia
 👉 PrismaStudio:    http://localhost:5555

-----------------------------------------------------
```

---

## Commandes utiles

### Développement

```bash
# Démarrer en mode développement (avec hot reload)
npm run start:dev

# Démarrer en mode debug
npm run start:debug

# Build le projet
npm run build

# Démarrer l'app compilée
npm run start:prod
```

### Base de données

```bash
# Ouvrir Prisma Studio (UI de gestion BD)
npm run studio
# URL: http://localhost:5555

# Générer le client Prisma
npm run prisma:generate

# Créer une nouvelle migration
npm run prisma:migrate dev --name <nom_migration>

# Appliquer les migrations
npm run prisma:migrate deploy

# Seed des données
npm run prisma:seed
```

### Tests

```bash
# Lancer tous les tests
npm run test

# Tests en mode watch
npm run test:watch

# Coverage des tests
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Linting & Formatting

```bash
# Vérifier le code
npm run lint

# Fixer automatiquement les erreurs
npm run lint:fix

# Formater le code
npm run format
```

---

## Endpoints de test rapide

### 1. Login

```bash
curl -X POST http://localhost:3000/connexion \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

### 2. Récupérer mes données

```bash
curl -X GET http://localhost:3000/user/personnalData \
  -b cookies.txt
```

### 3. Créer un utilisateur

```bash
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123",
    "role": "JOUEUR"
  }'
```

### 4. Lister les chasses

```bash
curl -X GET http://localhost:3000/chasse \
  -b cookies.txt
```

### 5. Créer une chasse (avec image)

```bash
curl -X POST http://localhost:3000/chasse \
  -H "Authorization: Bearer <jwt-token>" \
  -F "name=My Hunt" \
  -F "localisation=LYON" \
  -F "etat=ACTIVE" \
  -F "longitude=4.8357" \
  -F "latitude=45.7640" \
  -F 'occurrence={"date_start":"2024-06-01","date_end":"2024-06-30","limit_user":50}' \
  -F "image=@path/to/image.jpg"
```

---

## Documentation API (Swagger)

Accédez à la documentation interactive :

```
http://localhost:3000/api
```

Vous pouvez :
- ✅ Lister tous les endpoints
- ✅ Tester les routes directement
- ✅ Voir les paramètres requis
- ✅ Voir les responses attendues

---

## Débogage

### Activer les logs détaillés

```bash
# Dans .env
NODE_ENV=development
DEBUG=lootopia:*

# Démarrer
npm run start:dev
```

### Inspecteur Node.js

```bash
# Démarrer avec debugger
npm run start:debug

# Ouvrir chrome://inspect dans Chrome
# Connecter le debugger
```

### Prisma Studio pour inspecter la BD

```bash
npm run studio
```

Cela ouvre une interface graphique pour inspecter/éditer les données.

---

## Structure des fichiers générés

```
.
├── dist/                    # Code compilé (généré par build)
├── node_modules/            # Dépendances npm
├── prisma/
│   └── schema.prisma        # Schéma base de données
├── src/
│   ├── controllers/         # Routes HTTP
│   ├── services/            # Logique métier
│   ├── modules/             # Modules NestJS
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # Sécurité
│   ├── decorators/          # Métadonnées
│   ├── generated/           # Code généré Prisma
│   └── main.ts              # Point d'entrée
├── .env                     # Variables d'environnement
├── .env.example             # Template d'env
├── package.json
├── tsconfig.json
├── DOCUMENTATION.md         # Cette doc complète
├── ARCHITECTURE.md          # Diagrammes architecture
└── GETTING_STARTED.md       # Ce guide
```

---

## Troubleshooting

### Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
PORT=3001 npm run start:dev
```

### Erreur "Cannot find module @prisma/client"

```bash
npm run prisma:generate
npm install
```

### Erreur PostgreSQL connection refused

```bash
# Vérifier que PostgreSQL est actif
docker-compose ps
# ou
brew services list

# Relancer si nécessaire
docker-compose restart postgres
```

### Token JWT invalide

```bash
# Vérifier le JWT_SECRET dans .env
# S'assurer que le token n'a pas expiré
# Se reconnecter: POST /connexion
```

### Migration Prisma échouée

```bash
# Vérifier le statut des migrations
npm run prisma:migrate status

# Réinitialiser complètement (ATTENTION: données perdues!)
npm run prisma:migrate reset

# Puis regénérer
npm run prisma:generate
```

---

## Configuration Cloudinary

### 1. S'inscrire

Aller sur [https://cloudinary.com/](https://cloudinary.com/) et créer un compte gratuit.

### 2. Récupérer les clés

Dashboard → Account Settings → API Keys

### 3. Ajouter à .env

```env
API_KEY_CLOUDINARY=your_key_here
API_KEY_CLOUDINARY_SECRET=your_secret_here
```

### 4. Tester l'upload

```typescript
// Dans un service
const uploadResult = await cloudinary.uploader.upload(base64Image, {
  public_id: "test_image",
  folder: "lootopia"
});

console.log(uploadResult.secure_url); // URL sécurisée
```

---

## Déploiement

### Sur Vercel (Frontend) / Azure (Backend)

```bash
# Build pour production
npm run build

# Déployer (dépend de votre plateforme)
# - Azure: az deploy
# - Heroku: git push heroku main
# - Vercel: vercel deploy
```

### Variables d'environnement en production

```env
DATABASE_URL=postgresql://prod-user:password@prod-host:5432/lootopia_prod
JWT_SECRET=very_secure_random_secret_change_frequently
API_KEY_CLOUDINARY=prod_key
API_KEY_CLOUDINARY_SECRET=prod_secret
NODE_ENV=production
```

---

## Support & Ressources

| Ressource | Lien |
|---|---|
| **NestJS Docs** | https://docs.nestjs.com |
| **Prisma Docs** | https://www.prisma.io/docs |
| **TypeScript** | https://www.typescriptlang.org/docs |
| **Express** | https://expressjs.com |
| **PostgreSQL** | https://www.postgresql.org/docs |
| **Cloudinary** | https://cloudinary.com/documentation |

---

## Checklist de démarrage

- [ ] Cloner le repository
- [ ] `npm install`
- [ ] Créer `.env`
- [ ] `docker-compose up -d`
- [ ] `npm run prisma:generate`
- [ ] `npm run prisma:migrate`
- [ ] `npm run start:dev`
- [ ] Tester http://localhost:3000/api
- [ ] Créer un compte utilisateur
- [ ] Se connecter
- [ ] Tester une requête authentifiée

---

**Version** : 1.0  
**Dernière mise à jour** : 19 Mai 2026  
**Maintainers** : Jimmy
