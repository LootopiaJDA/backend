# 📚 Documentation Backend — Lootopia

> Projet d'études M1 DEVA 2025/2026 — SUP DE VINCI  
> Backend : Jimmy | Frontend : Damien | Gestion de projet : Alexandre  
> **Production :** http://20.46.53.133:3000

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Technologies](#2-technologies)
3. [Structure du projet](#3-structure-du-projet)
4. [Base de données](#4-base-de-données)
5. [Authentification & Autorisation](#5-authentification--autorisation)
6. [API Routes](#6-api-routes)
7. [DTOs et validation](#7-dtos-et-validation)
8. [Services — logique métier](#8-services--logique-métier)
9. [Sécurité](#9-sécurité)
10. [CI/CD et déploiement](#10-cicd-et-déploiement)
11. [GreenIT](#11-greenit)

---

## 1. Vue d'ensemble

**Lootopia** est une plateforme de chasse au trésor géolocalisée. Le backend expose une API REST sécurisée construite avec **NestJS** et **PostgreSQL**, déployée sur une **VM Azure** via un pipeline **GitHub Actions**.

### Acteurs du système

| Rôle | Description | Capacités |
|---|---|---|
| **JOUEUR** | Utilisateur grand public | Consulter chasses, participer, valider étapes, voir scores |
| **PARTENAIRE** | Entreprise partenaire | Créer/gérer ses chasses, définir étapes et occurrences |
| **ADMIN** | Superviseur plateforme | Valider partenaires, superviser toutes les données |

### Fonctionnalités implémentées (MVP complet)

- ✅ Authentification JWT (cookies HttpOnly, RBAC 3 rôles)
- ✅ Gestion des partenaires (inscription, validation admin, statuts)
- ✅ Création et gestion de chasses géolocalisées avec images (Cloudinary)
- ✅ Gestion des étapes (géolocalisation, rayon, rang, image)
- ✅ Gestion des occurrences (dates, limite participants)
- ✅ Participation des joueurs (rejoindre, valider étapes par GPS)
- ✅ Système de score et tableau de classement (ScoreBoard)
- ✅ CI/CD complet (GitHub Actions → Azure VM)

---

## 2. Technologies

| Technologie | Version | Rôle |
|---|---|---|
| **NestJS** | ^11.0.1 | Framework backend (IoC, DI, modules) |
| **TypeScript** | ^5.7.3 | Langage (typage fort) |
| **PostgreSQL** | 15 | Base de données relationnelle |
| **Prisma** | ^7.0.1 | ORM (schéma déclaratif, migrations, type-safety) |
| **Express** | (inclus NestJS) | Serveur HTTP |
| **@nestjs/jwt** | ^11.0.2 | Génération/vérification des tokens JWT |
| **@nestjs/swagger** | ^11.2.3 | Documentation API OpenAPI/Swagger |
| **class-validator** | ^0.14.4 | Validation des DTOs |
| **cloudinary** | ^2.8.0 | Stockage et CDN d'images |
| **bcrypt** | — | Hachage des mots de passe |
| **Docker / Compose** | — | Conteneurisation (dev et prod) |
| **GitHub Actions** | — | CI/CD automatisé |
| **Azure VM** | Ubuntu | Hébergement production |

---

## 3. Structure du projet

```
lootopiajda-backend/
├── src/
│   ├── main.ts                    # Bootstrap NestJS, config Swagger, CORS
│   ├── app.module.ts              # Module racine
│   ├── controllers/               # Entrées HTTP (routes)
│   ├── services/                  # Logique métier
│   ├── module/                    # Modules NestJS
│   ├── guards/                    # Auth, Roles, Ownership
│   ├── decorators/                # @Roles, @StatutChasse, @StatutPartenaire
│   ├── dto/                       # Objets de validation des requêtes
│   ├── repository/                # Abstraction Prisma (User, Chasse)
│   ├── interface/                 # Interfaces TypeScript (User, Admin)
│   ├── common/                    # Exceptions personnalisées
│   └── generated/prisma/          # Client Prisma (auto-généré)
├── prisma/
│   ├── schema.prisma              # Schéma BDD + enums
│   └── migrations/                # Migrations versionnées
├── test/                          # Tests E2E
├── .github/workflows/
│   ├── ci.yml                     # Pipeline CI (test/lint/build)
│   └── azure-webapps-node.yml     # Pipeline CD (deploy Azure)
├── dockerfile.dev                 # Image Docker développement
├── dockerfile.prod                # Image Docker production
├── docker-compose.yml             # Services locaux (backend + postgres + pgadmin)
├── docker-compose.prod.yml        # Services production
└── README.md / ARCHITECTURE.md / GETTING_STARTED.md
```

---

## 4. Base de données

Le schéma est défini dans `prisma/schema.prisma` et versionné via des migrations.

### Modèles

#### User
```prisma
model User {
  id_user     Int        @id @default(autoincrement())
  username    String
  role        Role       @default(JOUEUR)
  password    String     // bcrypt hash
  email       String     @unique
  created_at  DateTime   @default(now())
  updated_at  DateTime   @updatedAt
  partenerId  Int?
  partener    Partenaire? @relation(...)
  userchasses UserChasse[]
  scoreboards ScoreBoard[]
}
```

#### Partenaire
```prisma
model Partenaire {
  id_partenaire Int      @id @default(autoincrement())
  statut        Statut   @default(VERIFICATION)
  siret         String   @unique
  company_name  String
  adresse       String?
  users         User[]
  chasses       Chasse[]
}
```

#### Chasse
```prisma
model Chasse {
  id_chasse    Int          @id @default(autoincrement())
  name         String
  image        String       // URL Cloudinary
  localisation String
  longitude    Float
  latitude     Float
  etat         StatutChasse @default(PENDING)
  idPartenaire Int
  occurence    Occurence[]
  etape        Etape[]
  userchasses  UserChasse[]
  scoreboards  ScoreBoard[]
}
```

#### Etape
```prisma
model Etape {
  id          Int    @id @default(autoincrement())
  name        String
  lat         String
  long        String
  address     String
  description String
  rayon       Int    // rayon de validation GPS en mètres
  rank        Int    // ordre dans la chasse
  image       String // URL Cloudinary
  chasse_id   Int
}
```

### Enums

```prisma
enum Role             { ADMIN  PARTENAIRE  JOUEUR }
enum Statut           { VERIFICATION  ACTIVE  INACTIVE }
enum StatutChasse     { PENDING  ACTIVE  COMPLETED }
enum StatutUserChasse { IN_PROGRESS  COMPLETED  ABANDONED }
```

---

## 5. Authentification & Autorisation

### Flux JWT

1. Le client envoie `POST /connexion` avec `{ email, password }`.
2. AuthService vérifie le mot de passe (bcrypt.compare).
3. Un token JWT est généré (`{ sub: id_user, role, partenaire? }`).
4. Le token est placé dans un cookie **HttpOnly** `access_token`.
5. Chaque requête suivante inclut automatiquement le cookie.
6. `AuthGuard` vérifie et décode le token, injecte `req.user`.

### Ordre d'exécution des Guards

```
AuthGuard → (StatutPartenaireGuard) → RolesGuard → (OwnershipGuard)
```

| Guard | Rôle |
|---|---|
| `AuthGuard` | Vérifie la présence et la validité du JWT |
| `RolesGuard` | Vérifie que `req.user.role` est dans les rôles autorisés |
| `StatutPartenaireGuard` | Vérifie que le partenaire est au statut `ACTIVE` |
| `ChasseOwnershipGuard` | Vérifie que la chasse appartient au partenaire appelant |
| `ActiveChasseGuard` | Vérifie que la chasse est au statut `ACTIVE` |
| `OwnUserGuard` | Vérifie que l'utilisateur modifie son propre compte |

### Décorateurs

```typescript
@Roles(Role.PARTENAIRE)          // Restrict par rôle
@UseGuards(AuthGuard, RolesGuard) // Appliquer guards
```

---

## 6. API Routes

### Auth — `/connexion`

| Méthode | Route | Body | Description | Auth |
|---|---|---|---|---|
| POST | `/connexion` | `{ email, password }` | Login → cookie JWT | Non |
| GET | `/connexion/logout` | — | Logout → supprime cookie | Oui |

### User — `/user`

| Méthode | Route | Description | Rôle |
|---|---|---|---|
| POST | `/user` | Créer un joueur | Public |
| GET | `/user` | Lister tous les users | ADMIN |
| GET | `/user/:id` | Voir un user | ADMIN / Soi-même |
| PATCH | `/user/:id` | Modifier un user | ADMIN / Soi-même |
| DELETE | `/user/:id` | Supprimer un user | ADMIN / Soi-même |

### Partenaire — `/partenaire`

| Méthode | Route | Description | Rôle |
|---|---|---|---|
| POST | `/partenaire` | Créer un partenaire | ADMIN |
| GET | `/partenaire` | Lister les partenaires | ADMIN |
| PATCH | `/partenaire/:id` | Modifier un partenaire | ADMIN / Partenaire |

### Chasse — `/chasse`

| Méthode | Route | Description | Rôle |
|---|---|---|---|
| GET | `/chasse` | Lister les chasses actives | Authentifié |
| POST | `/chasse` | Créer une chasse (+ image upload) | PARTENAIRE |
| GET | `/chasse/:id` | Détail d'une chasse | Authentifié |
| PATCH | `/chasse/:id` | Modifier une chasse | PARTENAIRE (propriétaire) |
| DELETE | `/chasse/:id` | Supprimer une chasse | PARTENAIRE (propriétaire) |
| POST | `/chasse/:id/join` | Rejoindre une chasse | JOUEUR |

### Etape — `/etape`

| Méthode | Route | Description | Rôle |
|---|---|---|---|
| POST | `/etape` | Créer une étape | PARTENAIRE |
| PATCH | `/etape/:id` | Modifier une étape | PARTENAIRE (propriétaire) |
| DELETE | `/etape/:id` | Supprimer une étape | PARTENAIRE (propriétaire) |
| PATCH | `/etape/:id/validateEtape` | Valider une étape (GPS) | JOUEUR |

### Score — `/score`

| Méthode | Route | Description | Rôle |
|---|---|---|---|
| GET | `/score` | Classement général | Authentifié |
| GET | `/score/:chasseId` | Classement d'une chasse | Authentifié |

### Admin — `/admin`

| Méthode | Route | Description | Rôle |
|---|---|---|---|
| GET | `/admin/partenaires` | Voir partenaires en attente | ADMIN |
| PATCH | `/admin/valider/:id` | Valider/activer un partenaire | ADMIN |

---

## 7. DTOs et validation

Tous les corps de requête sont validés via `class-validator` + `ValidationPipe`.

### ChasseOccurrenceDto (exemple)

```typescript
class ChasseOccurrenceDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString()
  localisation: string;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  @IsEnum(StatutChasse)
  etat: StatutChasse;

  // occurrence (dates, limite participants)
  occurrence: OccurrenceDto;
}
```

---

## 8. Services — logique métier

| Service | Responsabilités clés |
|---|---|
| `AuthService` | Login (bcrypt), génération JWT, logout |
| `UserService` | CRUD utilisateurs, hachage password à la création |
| `ChasseService` | CRUD chasses, upload image Cloudinary, création avec occurrence |
| `EtapeService` | CRUD étapes, validation GPS (calcul distance / rayon) |
| `UserChasseService` | Rejoindre une chasse, progression des étapes |
| `ScoreService` | Calcul et récupération des scores, classement |
| `PrismaService` | Singleton PrismaClient, connexion BDD |
| `CryptoService` | Chiffrement AES-256, hachage bcrypt |

---

## 9. Sécurité

| Aspect | Implémentation |
|---|---|
| Authentification | JWT HS256, cookie HttpOnly (anti-XSS) |
| Autorisation | RBAC (Guards + décorateurs @Roles) |
| Mots de passe | bcrypt (hash + salt) |
| Données sensibles | AES-256 (CryptoService) |
| Validation entrées | ValidationPipe + class-validator (tous les DTOs) |
| Secrets | GitHub Secrets (jamais versionnés, jamais dans le code) |
| CORS | Origines autorisées explicitement dans main.ts |
| Ownership | Guards dédiés (Chasse, User) |
| Dépendances | Mises à jour régulières, Snyk recommandé |

---

## 10. CI/CD et déploiement

### Pipeline CI (`ci.yml`)
Déclenché sur **push/PR** vers `main` et `develop` :
1. `npm ci` — installation propre
2. `npx prisma generate` — génération du client
3. `npm test` — tests unitaires Jest
4. `docker build` — vérification que l'image se build
5. `npm run lint` — analyse ESLint

### Pipeline CD (`azure-webapps-node.yml`)
Déclenché sur **push** vers `main` :
1. Build image Docker (`dockerfile.prod`)
2. Push vers `ghcr.io/…/lootopia-backend:latest`
3. SSH sur la VM Azure (`20.46.53.133`)
4. `docker compose pull` + `docker compose up -d`
5. `docker exec lootopia-backend npx prisma migrate deploy`

**URL production :** http://20.46.53.133:3000

---

## 11. GreenIT

Bonnes pratiques intégrées pour limiter l'empreinte environnementale :

- **Requêtes Prisma optimisées** : `select` uniquement les champs nécessaires, pas de `SELECT *`
- **Pagination** des listes (évite le chargement de datasets complets)
- **Cloudinary CDN** : images optimisées et servies depuis le point le plus proche
- **Docker** : mutualisation des ressources, pas de sur-provisionnement
- **Indexes PostgreSQL** : `@@index([id_user])`, `@@index([id_chasse])` sur les tables de jointure
- **Cascade delete** sur les relations (nettoyage automatique des données orphelines)

---

*SUP DE VINCI — Mastère Développement Fullstack — M1 DEVA — 2025/2026*
