# 🏗️ Architecture Détaillée — Lootopia Backend

> Projet d'études M1 DEVA 2025/2026 — SUP DE VINCI  
> Backend : Jimmy | Frontend : Damien | Gestion de projet : Alexandre

---

## 1. Vue d'ensemble de l'architecture

Lootopia repose sur une **Layered Architecture** (architecture en couches) côté backend, découplée du frontend via une API REST.

### Architecture globale du système

```
┌──────────────────────────────────────────────────────────┐
│                   CLIENTS FRONTEND                        │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │  React Native        │  │  Next.js (Web)            │  │
│  │  (iOS / Android)     │  │  Dashboard partenaire/    │  │
│  │  Joueurs             │  │  admin                    │  │
│  └──────────┬──────────┘  └───────────┬──────────────┘  │
└─────────────┼────────────────────────┼──────────────────┘
              │        HTTP/REST        │
              └────────────┬───────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│              BACKEND NestJS — http://20.46.53.133:3000    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │                  COUCHE HTTP                      │    │
│  │  Express.js · CORS · Cookie Parser · Body Parser  │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────┐    │
│  │              COUCHE CONTRÔLEURS                   │    │
│  │  AuthController · UserController · ChasseCtrl    │    │
│  │  EtapeController · ScoreController · AdminCtrl   │    │
│  │  PartenaireController                             │    │
│  └──────────┬─────────────────────────┬─────────────┘    │
│             │                         │                    │
│  ┌──────────▼──────────┐  ┌──────────▼──────────────┐   │
│  │  GUARDS (Sécurité)  │  │  PIPES (Validation)      │   │
│  │  AuthGuard          │  │  ValidationPipe           │   │
│  │  RolesGuard         │  │  (class-validator)        │   │
│  │  OwnershipGuard     │  └─────────────────────────┘    │
│  │  ActiveChasseGuard  │                                   │
│  └──────────┬──────────┘                                  │
│             │                                              │
│  ┌──────────▼───────────────────────────────────────┐    │
│  │              COUCHE SERVICES (Métier)             │    │
│  │  AuthService · UserService · ChasseService        │    │
│  │  EtapeService · UserChasseService · ScoreService  │    │
│  │  PrismaService · CryptoService                    │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │                                  │
│  ┌──────────────────────▼───────────────────────────┐    │
│  │          COUCHE DONNÉES (Prisma ORM)              │    │
│  │  PrismaClient · Query Builder · Migrations        │    │
│  └──────────────────────┬───────────────────────────┘    │
└─────────────────────────┼──────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────┐
│              PostgreSQL 15 (Azure VM)                    │
│  Users · Partenaires · Chasses · Etapes                 │
│  Occurrences · UserChasses · ScoreBoards · Messages     │
└─────────────────────────────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │  Cloudinary (CDN)     │
              │  Stockage images      │
              └───────────────────────┘
```

---

## 2. Flux d'une requête HTTP

```
CLIENT REQUEST
│
├─> Middlewares Express
│   ├─ CORSMiddleware          (origines autorisées)
│   ├─ CookieParserMiddleware  (lecture cookies HttpOnly)
│   └─ BodyParserMiddleware    (parsing JSON/multipart)
│
├─> Route matching NestJS
│   └─ Résolution du Controller
│
├─> Exécution des Guards (ordre strict)
│   1. AuthGuard
│      ├─ Lit le cookie "access_token"
│      ├─ Valide la signature JWT
│      └─ Injecte req.user = { sub, role, partenaire }
│   2. StatutPartenaireGuard (si route partenaire)
│      └─ Vérifie statut ACTIVE du partenaire
│   3. RolesGuard
│      └─ Vérifie req.user.role ∈ rôles autorisés
│   4. OwnershipGuard / ActiveChasseGuard (si applicable)
│      └─ Vérifie que la ressource appartient à l'utilisateur
│   → 403 Forbidden si un guard rejette
│
├─> Pipes de validation
│   └─ ValidationPipe → class-validator sur les DTOs
│   → 400 Bad Request si validation échoue
│
├─> Exécution du Controller
│   ├─ Extraction des paramètres (body, params, query)
│   └─ Appel au Service
│
├─> Exécution du Service (logique métier)
│   ├─ Règles métier appliquées
│   ├─ Accès Prisma → PostgreSQL
│   ├─ Upload Cloudinary si image
│   └─ Retour résultat ou exception
│
└─> Réponse HTTP
    ├─ Status Code (200, 201, 400, 401, 403, 404...)
    ├─ Headers (CORS, Set-Cookie)
    └─ Body JSON
```

---

## 3. Flux d'authentification JWT

```
JOUEUR                     BACKEND                    POSTGRESQL
   │                           │                           │
   │  POST /connexion           │                           │
   │  { email, password }       │                           │
   │──────────────────────────>│                           │
   │                           │  SELECT User WHERE email  │
   │                           │──────────────────────────>│
   │                           │<──────────────────────────│
   │                           │  bcrypt.compare(password) │
   │                           │  sign JWT { sub, role }   │
   │                           │                           │
   │  200 OK                   │                           │
   │  Set-Cookie: access_token │                           │
   │  (HttpOnly, Secure)       │                           │
   │<──────────────────────────│                           │
   │                           │                           │
   │  GET /chasse              │                           │
   │  Cookie: access_token     │                           │
   │──────────────────────────>│                           │
   │                           │  jwt.verify(token)        │
   │                           │  req.user = payload       │
   │                           │  RolesGuard ✓             │
   │  200 OK + data            │                           │
   │<──────────────────────────│                           │
```

---

## 4. Schéma de base de données

```
┌──────────────┐       ┌──────────────────┐       ┌────────────────┐
│     User     │       │    Partenaire     │       │    Chasse      │
├──────────────┤       ├──────────────────┤       ├────────────────┤
│ id_user      │       │ id_partenaire     │       │ id_chasse      │
│ username     │       │ siret (unique)    │       │ name           │
│ email (uniq) │       │ company_name      │       │ image          │
│ password     │       │ adresse           │       │ localisation   │
│ role         │──────>│ statut            │<──────│ longitude      │
│ partenerId?  │       │ (VERIF/ACT/INACT) │       │ latitude       │
│ created_at   │       │ created_at        │       │ etat           │
│ updated_at   │       └──────────────────┘       │ idPartenaire   │
└──────┬───────┘                                   └───────┬────────┘
       │                                                   │
       │              ┌────────────────┐                  │
       │              │    Occurence   │                  │
       │              ├────────────────┤<─────────────────┤
       │              │ id_occurence   │                  │
       │              │ date_start     │                  │
       │              │ date_end       │                  │
       │              │ limit_user     │                  │
       │              └────────────────┘                  │
       │                                                   │
       │              ┌────────────────┐                  │
       │              │     Etape      │                  │
       │              ├────────────────┤<─────────────────┤
       │              │ id             │                  │
       │              │ name           │                  │
       │              │ lat / long     │                  │
       │              │ address        │                  │
       │              │ rayon          │                  │
       │              │ rank           │                  │
       │              │ image          │                  │
       │              └───────┬────────┘                  │
       │                      │                           │
       │    ┌─────────────────▼──────┐                   │
       │    │      UserChasse        │                   │
       │    ├───────────────────────┤                   │
       └───>│ id_userchasse         │<──────────────────┘
            │ id_user               │
            │ id_chasse             │
            │ statut                │
            │ (IN_PROG/DONE/ABAND)  │
            │ started_at            │
            │ completed_at?         │
            └──────────┬────────────┘
                       │
            ┌──────────▼────────────┐     ┌───────────────┐
            │   UserChasseEtape     │     │  ScoreBoard   │
            ├───────────────────────┤     ├───────────────┤
            │ id_userchasseetape    │     │ id_user       │
            │ (suivi étape/étape)   │     │ id_chasse     │
            └───────────────────────┘     └───────────────┘
```

**Enums :**

| Enum | Valeurs |
|---|---|
| `Role` | `ADMIN` · `PARTENAIRE` · `JOUEUR` |
| `Statut` (partenaire) | `VERIFICATION` · `ACTIVE` · `INACTIVE` |
| `StatutChasse` | `PENDING` · `ACTIVE` · `COMPLETED` |
| `StatutUserChasse` | `IN_PROGRESS` · `COMPLETED` · `ABANDONED` |

---

## 5. Structure des modules NestJS

```
src/
├── app.module.ts              # Module racine (import de tous les modules)
│
├── controllers/               # Points d'entrée HTTP
│   ├── auth.controller.ts     # POST /connexion, GET /connexion/logout
│   ├── user.controller.ts     # CRUD utilisateurs
│   ├── chasse.controller.ts   # CRUD chasses
│   ├── etape.controller.ts    # CRUD étapes + validation géo
│   ├── partenaire.controller.ts
│   ├── score.controller.ts
│   └── admin.controller.ts
│
├── services/                  # Logique métier
│   ├── auth.service.ts        # Login/logout, génération JWT
│   ├── user.service.ts
│   ├── chasse.service.ts      # Création chasse + upload Cloudinary
│   ├── etape.service.ts       # Validation étape par géolocalisation
│   ├── userChasse.service.ts  # Participation joueur
│   ├── score.service.ts       # Calcul et récupération scores
│   ├── prisma.service.ts      # Singleton PrismaClient
│   └── crypto.service.ts      # Chiffrement AES-256 / bcrypt
│
├── guards/                    # Sécurité
│   ├── auth.guard.ts          # Vérifie JWT
│   ├── roles.guard.ts         # Vérifie le rôle (@Roles decorator)
│   ├── ChasseOwnershipGuard   # Partenaire = propriétaire de la chasse
│   ├── activeChasse.guard.ts  # Chasse au statut ACTIVE
│   ├── partenaire.guard.ts    # Partenaire au statut ACTIVE
│   └── ownUserGuard.guard.ts  # Utilisateur = lui-même
│
├── decorators/
│   ├── role.decorator.ts      # @Roles(Role.ADMIN)
│   ├── statut-chasse.decorator.ts
│   └── statut-partenaire.decorator.ts
│
├── dto/                       # Validation des entrées
│   ├── chasse.dto.ts
│   ├── chasseOccurence.dto.ts
│   ├── etape.dto.ts
│   ├── partenair.dto.ts
│   ├── user.tdo.ts
│   └── connexion.tdo.ts
│
├── module/                    # Modules NestJS
│   ├── auth.module.ts
│   ├── user.module.ts
│   ├── chasse.module.ts
│   ├── etape.module.ts
│   ├── partenair.module.ts
│   ├── score.module.ts
│   └── admin.module.ts
│
├── repository/                # Accès données (abstraction Prisma)
│   ├── user.repository.ts
│   └── chasse.repository.ts
│
└── generated/prisma/          # Client Prisma auto-généré
    └── (ne pas modifier manuellement)
```

---

## 6. Infrastructure CI/CD

```
GitHub (push → main)
        │
        ▼
┌────────────────────────────────────────────────────┐
│  GitHub Actions CI (ci.yml)                        │
│  ① npm ci                                          │
│  ② npx prisma generate                             │
│  ③ npm test                                        │
│  ④ docker build -f dockerfile.prod                 │
│  ⑤ npm run lint                                    │
└────────────────────────────────────────────────────┘
        │ (si CI réussit)
        ▼
┌────────────────────────────────────────────────────┐
│  GitHub Actions CD (azure-webapps-node.yml)        │
│  ① docker build + push → ghcr.io/…/lootopia:latest│
│  ② SSH → azureuser@20.46.53.133                   │
│  ③ docker compose pull                             │
│  ④ docker compose up -d                            │
│  ⑤ docker exec … prisma migrate deploy            │
└────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────┐
│  Azure VM Ubuntu                                    │
│  ├─ lootopia-backend  :3000  (NestJS)              │
│  ├─ lootopia-postgres :5432  (PostgreSQL 15)       │
│  └─ lootopia-pgadmin  :5050  (pgAdmin 4)           │
└────────────────────────────────────────────────────┘
```

---

## 7. Sécurité (Security by Design)

| Mécanisme | Implémentation |
|---|---|
| Authentification | JWT signé (HS256), stocké en cookie HttpOnly |
| Autorisation | RBAC via Guards NestJS + décorateurs |
| Mots de passe | bcrypt (hash + salt, jamais en clair) |
| Données sensibles | AES-256 via CryptoService |
| Validation entrées | ValidationPipe + class-validator sur tous les DTOs |
| Secrets | GitHub Secrets (jamais versionnés) |
| CORS | Origines autorisées configurées dans main.ts |
| Ownership | Guards vérifient que la ressource appartient à l'appelant |

---

*SUP DE VINCI — M1 DEVA — 2025/2026 — Jimmy · Damien · Alexandre*
