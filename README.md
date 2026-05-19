# 🎯 Lootopia - Backend API

Plateforme de chasse au trésor (treasure hunt) construite avec **NestJS** et **PostgreSQL**.

## 📚 Documentation

La documentation complète du backend est divisée en 3 parties :

### 1. **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentation Complète
   - Vue d'ensemble du projet
   - Architecture générale
   - Technologies utilisées
   - Structure du projet
   - Schéma base de données
   - Authentification & Autorisation
   - **Toutes les routes API** avec exemples
   - Flux de traitement détaillés
   - DTOs et Interfaces
   - Guides de développement

   **À lire en premier pour comprendre le projet.**

### 2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Diagrammes & Architecture Technique
   - Schémas visuels en ASCII
   - Architecture en couches
   - Flux HTTP détaillé
   - Cycle de vie d'une requête
   - Flux d'authentification JWT
   - Structure des modules NestJS
   - Gestion des erreurs
   - Patterns et bonnes pratiques

   **À lire pour approfondir la structure technique.**

### 3. **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Guide Pratique de Démarrage
   - Prérequis d'installation
   - Installation pas à pas
   - Configuration variables d'environnement
   - Commandes utiles (npm scripts)
   - Endpoints de test rapide
   - Débogage
   - Troubleshooting
   - Déploiement

   **À lire pour démarrer localement.**

---

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer .env (voir GETTING_STARTED.md)
cp .env.example .env

# 3. Démarrer PostgreSQL
docker-compose up -d

# 4. Initialiser la base de données
npm run prisma:generate
npm run prisma:migrate

# 5. Lancer le serveur
npm run start:dev

# 6. Accéder à l'API
# API: http://localhost:3000
# Swagger: http://localhost:3000/api
```

---

## 📋 Stack Technologique

| Technologie | Version | Rôle |
|---|---|---|
| **NestJS** | ^11.0.1 | Framework backend |
| **TypeScript** | ^5.7.3 | Langage |
| **PostgreSQL** | 12+ | Base de données |
| **Prisma** | ^7.0.1 | ORM |
| **Express** | (inclus) | Serveur HTTP |
| **JWT** | ^11.0.2 | Authentification |
| **Cloudinary** | ^2.8.0 | Stockage d'images |

---

## 🏗️ Architecture

```
CLIENT → NestJS Controllers → Services → Prisma → PostgreSQL
              ↑                  ↑          ↑
         Guards, Pipes      Business    ORM
         Validation         Logic       
```

Consultez [ARCHITECTURE.md](./ARCHITECTURE.md) pour les diagrammes détaillés.

---

## 🔐 Authentification

- **JWT** stocké dans les cookies HTTP-only
- Expiration : 1 heure
- Rôles : ADMIN, PARTENAIRE, JOUEUR
- Guards pour la sécurité par rôle et propriété

Voir [DOCUMENTATION.md#authentification--autorisation](./DOCUMENTATION.md#authentification--autorisation)

---

## 📡 Routes API Principales

### Authentification
- `POST /connexion` - Login
- `GET /connexion/logout` - Logout

### Utilisateurs
- `POST /user` - Créer joueur
- `POST /user/partenaire` - Créer partenaire
- `GET /user/personnalData` - Mes données
- `PUT /user/:id` - Modifier utilisateur

### Chasses
- `GET /chasse` - Lister
- `POST /chasse` - Créer (PARTENAIRE)
- `PATCH /chasse/:id` - Modifier
- `DELETE /chasse/:id` - Supprimer
- `POST /chasse/:id/join` - Rejoindre (JOUEUR)
- `PATCH /chasse/:id/complete` - Compléter
- `PATCH /chasse/:id/leave` - Abandonner

### Étapes
- `GET /etape` - Lister
- `POST /etape/:id` - Créer
- `PATCH /etape/:idChasse/:idEtape` - Modifier
- `DELETE /etape/:idChasse/:idEtape` - Supprimer
- `POST /etape/:idChasse/:idEtape/validateEtape` - Valider

**Consultez [DOCUMENTATION.md#api-routes](./DOCUMENTATION.md#api-routes) pour la liste complète.**

---

## 🗄️ Base de Données

Modèles principaux :
- **User** - Utilisateurs (ADMIN, PARTENAIRE, JOUEUR)
- **Partenaire** - Créateurs de chasses
- **Chasse** - Chasses au trésor
- **Etape** - Étapes/Points de chasse
- **UserChasse** - Participation des joueurs
- **UserChasseEtape** - Progression dans les étapes
- **ScoreBoard** - Scores des joueurs
- **Occurrence** - Éditions/Périodes de chasse

**Schéma ER complet** : [DOCUMENTATION.md#base-de-données](./DOCUMENTATION.md#base-de-données)

---

## 🔧 Commandes npm

```bash
# Développement
npm run start:dev          # Hot reload
npm run start:debug        # Debugger Node.js
npm run build              # Compiler

# Tests
npm run test               # Jest tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage

# Base de données
npm run prisma:generate    # Générer types Prisma
npm run prisma:migrate     # Créer migration
npm run studio             # Ouvrir Prisma Studio

# Linting
npm run lint               # Vérifier
npm run lint:fix           # Fixer erreurs
npm run format             # Formatter code
```

**Voir [GETTING_STARTED.md#commandes-utiles](./GETTING_STARTED.md#commandes-utiles) pour plus.**

---

## 📖 Pour les développeurs

### Ajouter une nouvelle route
1. Créer la méthode dans le Service
2. Créer la méthode dans le Controller
3. Enregistrer le module
4. Tester via Swagger

Voir [DOCUMENTATION.md#1-ajouter-une-nouvelle-route](./DOCUMENTATION.md#1-ajouter-une-nouvelle-route)

### Ajouter un Guard
Consultez [DOCUMENTATION.md#2-ajouter-un-guard-personnalisé](./DOCUMENTATION.md#2-ajouter-un-guard-personnalisé)

### Ajouter une validation DTO
Consultez [DOCUMENTATION.md#3-ajouter-une-validation-dto](./DOCUMENTATION.md#3-ajouter-une-validation-dto)

### Travailler avec Cloudinary
Consultez [DOCUMENTATION.md#4-travailler-avec-cloudinary](./DOCUMENTATION.md#4-travailler-avec-cloudinary)

---

## 🐛 Dépannage

### Problèmes courants
- Port 3000 déjà utilisé → [Voir GETTING_STARTED.md](./GETTING_STARTED.md#port-3000-déjà-utilisé)
- Cannot find module → [Voir GETTING_STARTED.md](./GETTING_STARTED.md#erreur-cannot-find-module-prismaclient)
- PostgreSQL connection error → [Voir GETTING_STARTED.md](./GETTING_STARTED.md#erreur-postgresql-connection-refused)

---

## ☁️ Azure Deployment

### Accéder au shell Azure

```bash
# Se connecter au serveur Azure via SSH
ssh -i "chemin/vers/Jeu de clé.pem" Utilisateur@IpAzure
```

### Commandes utiles en production

```bash
# Voir les logs du backend
docker logs -f lootopia-backend

# Accéder à la base de données PostgreSQL
docker exec -it lootopia-postgres psql -U admin -d lootopia

# Redémarrer les services
docker-compose restart

# Voir le status des containers
docker-compose ps
```

---

## 📞 Support

- **Swagger/Docs** : http://localhost:3000/api
- **Prisma Studio** : `npm run studio`
- **NestJS Docs** : https://docs.nestjs.com
- **Prisma Docs** : https://www.prisma.io/docs

---

## 📝 Environnement

Créer un fichier `.env` à la racine :

```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/lootopia
API_KEY_CLOUDINARY=your_key
API_KEY_CLOUDINARY_SECRET=your_secret
JWT_SECRET=your_secret
NODE_ENV=development
PORT=3000
```

Voir [GETTING_STARTED.md#3-configurer-les-variables-denvironnement](./GETTING_STARTED.md#3-configurer-les-variables-denvironnement)

---

## 🎓 Lectures recommandées

1. **Pour comprendre le projet** → [DOCUMENTATION.md](./DOCUMENTATION.md)
2. **Pour la structure technique** → [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Pour démarrer en local** → [GETTING_STARTED.md](./GETTING_STARTED.md)
4. **Pour tester l'API** → http://localhost:3000/api

---

## 📄 License

MIT License

---

**Version** : 1.0  
**Dernière mise à jour** : 19 Mai 2026  
**Status** : ✅ Production Ready
