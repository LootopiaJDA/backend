# 📚 Documentation Backend - Lootopia

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Technologies](#technologies)
4. [Structure du projet](#structure-du-projet)
5. [Base de données](#base-de-données)
6. [Authentification & Autorisation](#authentification--autorisation)
7. [API Routes](#api-routes)
8. [Flux de traitement](#flux-de-traitement)
9. [DTOs et Interfaces](#dtos-et-interfaces)
10. [Guides de développement](#guides-de-développement)

---

## Vue d'ensemble

**Lootopia** est un backend construit avec **NestJS** qui gère une plateforme de "chasse" (treasure hunts) où :
- Les **JOUEURS** peuvent découvrir et participer à des chasses au trésor
- Les **PARTENAIRES** créent et gèrent les chasses avec leurs différentes étapes
- Les **ADMINS** supervisant la plateforme

Le système inclut :
- Gestion des utilisateurs avec rôles distincts
- Authentification par JWT
- Gestion des chasses avec étapes géolocalisées
- Système de scoring
- Upload d'images via Cloudinary

---

## Architecture

### Schéma en couches

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                    (HTTP/REST)
                         │
         ┌───────────────▼──────────────────┐
         │    Express / NestJS HTTP Layer   │
         │  (CORS, Validation, Middleware)  │
         └───────────────┬──────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼────────┐  ┌────────▼──────────┐  ┌─────▼──────────┐
│ Controllers │  │  Guards & Pipes  │  │   Decorators   │
│  (Routes)   │  │  (Auth, Validation)│ │  (Role, Auth) │
└───┬────────┘  └────────┬──────────┘  └─────┬──────────┘
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
         ┌───────────────▼──────────────────┐
         │         Services Layer           │
         │  (Business Logic)                │
         └───────────────┬──────────────────┘
                         │
         ┌───────────────▼──────────────────┐
         │    Repositories & Data Layer     │
         │     (Prisma ORM)                 │
         └───────────────┬──────────────────┘
                         │
         ┌───────────────▼──────────────────┐
         │      PostgreSQL Database         │
         └──────────────────────────────────┘
```

### Pattern d'architecture

Le backend suit le pattern **Layered Architecture** :

1. **Controllers** : Points d'entrée HTTP, gestion des routes
2. **Services** : Logique métier, orchestration
3. **Repositories** : Accès aux données (via Prisma)
4. **Guards** : Sécurité (authentification, autorisation)
5. **DTOs** : Validation des données reçues
6. **Decorators** : Métadonnées pour contrôle d'accès

---

## Technologies

### Stack principal

| Technologie | Version | Rôle |
|---|---|---|
| **NestJS** | ^11.0.1 | Framework backend |
| **TypeScript** | ^5.7.3 | Langage |
| **PostgreSQL** | 12+ | Base de données |
| **Prisma** | ^7.0.1 | ORM |
| **Express** | (natif NestJS) | Serveur HTTP |

### Dépendances clés

```json
{
  "@nestjs/core": "^11.0.1",           // Core NestJS
  "@nestjs/jwt": "^11.0.2",            // Authentification JWT
  "@nestjs/swagger": "^11.2.3",        // Documentation API (Swagger)
  "@prisma/client": "^7.2.0",          // ORM pour PostgreSQL
  "class-validator": "^0.14.4",        // Validation des DTOs
  "cloudinary": "^2.8.0",              // Stockage d'images
  "pg": "^8.16.3"                      // Driver PostgreSQL
}
```

### Services externes

- **Cloudinary** : Stockage et optimisation d'images
- **PostgreSQL** : Base de données principale
- **JWT** : Authentification stateless

---

## Structure du projet

```
src/
├── controllers/                # Points d'entrée HTTP
│   ├── auth.controller.ts      # Connexion/Déconnexion
│   ├── user.controller.ts      # Gestion utilisateurs
│   ├── chasse.controller.ts    # Gestion chasses
│   ├── etape.controller.ts     # Gestion étapes
│   ├── admin.controller.ts     # Actions admin
│   ├── partenaire.controller.ts
│   └── score.controller.ts
│
├── services/                   # Logique métier
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── chasse.service.ts
│   ├── etape.service.ts
│   ├── userChasse.service.ts   # Gestion participation utilisateurs
│   ├── score.service.ts
│   ├── prisma.service.ts       # Configuration Prisma
│   ├── crypto.service.ts       # Chiffrement/Hachage
│   └── ...
│
├── module/                     # Modules NestJS
│   ├── app.module.ts           # Module racine
│   ├── auth.module.ts
│   ├── user.module.ts
│   ├── chasse.module.ts
│   ├── etape.module.ts
│   ├── admin.module.ts
│   ├── score.module.ts
│   └── partenair.module.ts
│
├── dto/                        # Data Transfer Objects (Validation)
│   ├── user.tdo.ts
│   ├── connexion.tdo.ts
│   ├── chasse.dto.ts
│   ├── etape.dto.ts
│   ├── partenair.dto.ts
│   └── ...
│
├── guards/                     # Sécurité & Autorisation
│   ├── auth.guard.ts           # Vérifie la présence du token JWT
│   ├── roles.guard.ts          # Vérifie le rôle de l'utilisateur
│   ├── ownUserGuard.guard.ts   # Vérifie la propriété de la ressource
│   ├── partenaire.guard.ts     # Vérifie le statut du partenaire
│   ├── ChasseOwnershipGuard.guard.ts # Vérifie la propriété de la chasse
│   └── ...
│
├── decorators/                 # Métadonnées & Décorateurs
│   ├── role.decorator.ts       # @Roles(Role.ADMIN)
│   ├── statut-chasse.decorator.ts
│   └── ...
│
├── interface/                  # Types TypeScript
│   ├── user.interface.ts
│   └── admin.interface.ts
│
├── repository/                 # Accès aux données
│   ├── user.repository.ts
│   ├── chasse.repository.ts
│   └── ...
│
├── common/                     # Utilitaires communs
│   └── ForbiddenExc.ts         # Exceptions personnalisées
│
├── generated/                  # Code généré automatiquement
│   └── prisma/                 # Types Prisma générés
│
├── main.ts                     # Point d'entrée application
└── app.controller.spec.ts
```

---

## Base de données

### Schéma ER (Entity Relationship)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Modèle de Données                           │
└─────────────────────────────────────────────────────────────────────┘

USER (Utilisateurs)
├─ id_user (PK) 🔑
├─ username (String, unique)
├─ email (String, unique)
├─ password (String, hashé)
├─ role (Enum: ADMIN, PARTENAIRE, JOUEUR)
├─ partenerId (FK → Partenaire)
├─ created_at
├─ updated_at
├─ Relations:
│  ├─ userchasses (1:many) - Les chasses auxquelles participe l'utilisateur
│  └─ scoreboards (1:many) - Scores de l'utilisateur

PARTENAIRE (Partenaires - Créateurs de chasses)
├─ id_partenaire (PK) 🔑
├─ siret (String, unique)
├─ company_name (String)
├─ statut (Enum: VERIFICATION, ACTIVE, INACTIVE)
├─ adresse (String, nullable)
├─ created_at
├─ updated_at
├─ Relations:
│  ├─ users (1:many) - Utilisateurs du partenaire
│  └─ chasses (1:many) - Chasses créées par ce partenaire

CHASSE (Chasses au trésor)
├─ id_chasse (PK) 🔑
├─ name (String)
├─ image (String, URL)
├─ localisation (String)
├─ longitude (Float)
├─ latitude (Float)
├─ etat (Enum: PENDING, ACTIVE, COMPLETED)
├─ idPartenaire (FK → Partenaire)
├─ created_at
├─ Relations:
│  ├─ partenaire (many:1) - Partenaire propriétaire
│  ├─ occurence (1:many) - Occurrences/Éditions de la chasse
│  ├─ etape (1:many) - Étapes de la chasse
│  ├─ userchasses (1:many) - Participations utilisateurs
│  └─ scoreboards (1:many) - Scores

OCCURENCE (Occurrences/Éditions de chasse)
├─ id_occurence (PK) 🔑
├─ chasse_id (FK → Chasse) onDelete: CASCADE
├─ date_start (DateTime)
├─ date_end (DateTime)
├─ limit_user (Int, défaut: 0)
├─ created_at
└─ Relation:
   └─ chasse (many:1)

ETAPE (Étapes d'une chasse)
├─ id (PK) 🔑
├─ chasse_id (FK → Chasse) onDelete: CASCADE
├─ name (String)
├─ lat (String)
├─ long (String)
├─ address (String)
├─ description (String)
├─ rayon (Int, rayon en mètres)
├─ rank (Int, ordre dans la chasse)
├─ image (String, URL)
├─ created_at
├─ Index: chasse_id
└─ Relations:
   ├─ chasse (many:1)
   └─ UserChasseEtape (1:many)

USERCHASSE (Jointure: Participation de joueurs aux chasses)
├─ id_userchasse (PK) 🔑
├─ id_user (FK → User)
├─ id_chasse (FK → Chasse)
├─ started_at (DateTime)
├─ completed_at (DateTime, nullable)
├─ statut (Enum: IN_PROGRESS, COMPLETED, ABANDONED)
├─ Unique: [id_user, id_chasse]
├─ Indexes: id_user, id_chasse
└─ Relations:
   ├─ user (many:1)
   ├─ chasse (many:1)
   └─ UserChasseEtape (1:many)

USERCHASEETAPE (Jointure: Progression dans les étapes)
├─ id_userchasseetape (PK) 🔑
├─ id_userchasse (FK → UserChasse)
├─ id_etape (FK → Etape)
├─ reached_at (DateTime)
├─ Unique: [id_userchasse, id_etape]
├─ Indexes: id_userchasse, id_etape
└─ Relations:
   ├─ userchasse (many:1)
   └─ etape (many:1)

SCOREBOARD (Scores des joueurs par chasse)
├─ id_score (PK) 🔑
├─ id_user (FK → User)
├─ id_chasse (FK → Chasse)
├─ score (Int, défaut: 0)
├─ created_at
├─ updated_at
├─ Unique: [id_user, id_chasse]
├─ Indexes: id_user, id_chasse
└─ Relations:
   ├─ user (many:1)
   └─ chasse (many:1)

MESSAGE (Messages)
├─ id_message (PK) 🔑
├─ content (String)
└─ created_at
```

### Énumérations

```typescript
enum Role {
  ADMIN      // Administrateur système
  PARTENAIRE // Créateur de chasses
  JOUEUR     // Participant/Joueur
}

enum Statut {
  VERIFICATION // Partenaire en vérification
  ACTIVE       // Partenaire actif
  INACTIVE     // Partenaire inactif
}

enum StatutChasse {
  PENDING    // Chasse en attente
  ACTIVE     // Chasse active
  COMPLETED  // Chasse complétée
}

enum StatutUserChasse {
  IN_PROGRESS // Chasse en cours
  COMPLETED   // Chasse complétée
  ABANDONED   // Chasse abandonnée
}
```

---

## Authentification & Autorisation

### Flux d'authentification

```
1. USER LOGIN
   │
   ├─> POST /connexion { email, password }
   │   │
   │   ├─> Vérifier existence utilisateur
   │   ├─> Valider password (bcrypt)
   │   │
   │   └─> Générer JWT Token
   │       └─> Stocker dans Cookie (httpOnly)
   │
   └─> Retourner: { message: "Connexion réussie" }

2. SUBSEQUENT REQUESTS
   │
   ├─> Client envoie Cookie avec JWT
   │   │
   │   ├─> AuthGuard extrait le token
   │   ├─> Valide la signature JWT
   │   ├─> Extrait payload (user.sub = id_user)
   │   │
   │   └─> Ajoute req.user avec les infos
   │
   └─> Requête continue ou est bloquée

3. ROLE-BASED ACCESS
   │
   ├─> @Roles(Role.ADMIN) décorateur
   │   │
   │   ├─> RolesGuard vérifie le rôle
   │   ├─> Compare req.user.role avec les rôles requis
   │   │
   │   └─> Bloque ou autorise l'accès
   │
   └─> Message d'erreur si rôle insuffisant

4. LOGOUT
   └─> GET /connexion/logout
       └─> Efface le Cookie access_token
```

### Guards (Sécurité)

| Guard | Lieu | Rôle |
|---|---|---|
| **AuthGuard** | `src/guards/auth.guard.ts` | Vérifie la présence du JWT dans les cookies |
| **RolesGuard** | `src/guards/roles.guard.ts` | Vérifie que l'utilisateur a le rôle requis |
| **ownUserGuard** | `src/guards/ownUserGuard.guard.ts` | Vérifie que l'utilisateur modifie ses propres données |
| **StatutPartenerGuard** | `src/guards/partenaire.guard.ts` | Vérifie que le partenaire est ACTIVE |
| **ChasseOwnershipGuard** | `src/guards/ChasseOwnershipGuard.guard.ts` | Vérifie que le partenaire possède la chasse |

### Decorators

```typescript
@Roles(Role.ADMIN)           // Restreindre par rôle
@Statuts(Statut.ACTIVE)      // Restreindre par statut de partenaire
@UseGuards(AuthGuard)        // Exiger authentification
@UseGuards(RolesGuard)       // Appliquer vérification de rôle
```

---

## API Routes

### 1. AUTHENTIFICATION (`/connexion`)

#### Login
```
POST /connexion
Body: {
  email: string,
  password: string
}
Response (200): { message: "Connexion réussie" }
Cookies: access_token (JWT)
```

**Flow:**
```
POST /connexion
  ├─> AuthService.login()
  │   ├─> Chercher utilisateur par email
  │   ├─> Comparer password avec bcrypt
  │   └─> Générer JWT token
  └─> Répondre avec cookie
```

#### Logout
```
GET /connexion/logout
Auth: Required (Bearer JWT)
Response (200): { message: "Déconnexion réussie" }
Side Effect: Efface le cookie access_token
```

---

### 2. UTILISATEURS (`/user`)

#### Obtenir ses données personnelles
```
GET /user/personnalData
Auth: Required
Response (200): {
  id_user: number,
  username: string,
  email: string,
  role: Role,
  created_at: DateTime,
  updated_at: DateTime
}
```

#### Créer un utilisateur (Joueur)
```
POST /user
Body: {
  username: string,
  email: string,
  password: string,
  role: "JOUEUR"
}
Response (201): { id_user, username, email, ... }
```

#### Lister tous les utilisateurs
```
GET /user
Auth: Required
Role: ADMIN
Response (200): User[]
```

#### Modifier un utilisateur
```
PUT /user/:id
Auth: Required
Guard: ownUserGuard (peut modifier ses propres données)
Body: {
  username?: string,
  email?: string,
  password?: string
}
Response (200): { message: "User updated successfully" }
```

#### Créer un utilisateur Partenaire
```
POST /user/partenaire
Body: {
  username: string,
  email: string,
  password: string,
  siret: string,
  company_name: string,
  adresse?: string
}
Response (201): {
  id_user: number,
  partenaire: {
    id_partenaire: number,
    siret: string,
    company_name: string,
    statut: "VERIFICATION"
  }
}
```

---

### 3. CHASSES (`/chasse`)

#### Obtenir toutes les chasses
```
GET /chasse
Query:
  - partenaire?: number (filtrer par partenaire)
  - localisation?: string (filtrer par localisation)
Response (200): {
  allChasse: Chasse[] | chasseByPart: Chasse[]
}
```

#### Obtenir les chasses de l'utilisateur connecté
```
GET /chasse/me
Auth: Required
Role: JOUEUR
Response (200): {
  chasses: UserChasse[]  // Les chasses auxquelles il participe
}
```

#### Obtenir une chasse par ID
```
GET /chasse/:id
Response (200): {
  name: string,
  localisation: string,
  etat: StatutChasse,
  image: string,
  occurence: Occurence[],
  etape: Etape[]
}
```

#### Créer une chasse
```
POST /chasse
Auth: Required
Role: PARTENAIRE
Status: Partenaire ACTIVE
Content-Type: multipart/form-data
Body: {
  name: string,
  localisation: string,
  etat: "PENDING" | "ACTIVE",
  longitude: number,
  latitude: number,
  image: File,
  occurrence: {
    date_start: "YYYY-MM-DD",
    date_end: "YYYY-MM-DD",
    limit_user: number
  }
}
Response (201): {
  message: "Chasse created",
  imageUrl: string (Cloudinary)
}
```

**Flow:**
```
POST /chasse
  ├─> Vérifier: Authentification + Rôle PARTENAIRE
  ├─> Uploader image vers Cloudinary
  ├─> Valider dates d'occurrence
  ├─> ChasseService.createChasse()
  │   └─> Prisma.chasse.create()
  └─> Retourner URL image
```

#### Modifier une chasse
```
PATCH /chasse/:id
Auth: Required
Role: PARTENAIRE
Guard: ChasseOwnershipGuard (partenaire propriétaire)
Body: {
  name?: string,
  localisation?: string,
  etat?: StatutChasse,
  longitude?: number,
  latitude?: number
}
Response (200): { message: "Chasse updated" }
```

#### Supprimer une chasse
```
DELETE /chasse/:id
Auth: Required
Role: PARTENAIRE
Guard: ChasseOwnershipGuard
Response (200): { message: "Chasse deleted" }
```

#### Rejoindre une chasse
```
POST /chasse/:id/join
Auth: Required
Role: JOUEUR
Response (200): { message: "Inscription successful" }
Side Effect: Crée une entrée UserChasse
```

#### Compléter une chasse
```
PATCH /chasse/:id/complete
Auth: Required
Role: JOUEUR
Response (200): { message: "Chasse completed" }
Side Effect: Met à jour UserChasse.statut = COMPLETED
```

#### Abandonner une chasse
```
PATCH /chasse/:idChasse/leave
Auth: Required
Role: JOUEUR
Response (200): { message: "Left chasse successfully" }
Side Effect: Met à jour UserChasse.statut = ABANDONED
```

---

### 4. ÉTAPES (`/etape`)

#### Obtenir les étapes
```
GET /etape
Query:
  - idChasse?: number (étapes d'une chasse spécifique)
  - idEtape?: number (une étape spécifique)
Response (200): Etape | Etape[] | { message: "No etape found" }
```

**Cas d'utilisation:**
- `/etape` → Toutes les étapes
- `/etape?idEtape=5` → Étape avec id=5
- `/etape?idChasse=2` → Étapes de la chasse id=2
- `/etape?idChasse=2&idEtape=5` → Étape 5 de la chasse 2

#### Créer une étape
```
POST /etape/:id (id = chasse id)
Auth: Required
Role: PARTENAIRE
Guard: ChasseOwnershipGuard
Content-Type: multipart/form-data
Body: {
  name: string,
  lat: string,
  long: string,
  address: string,
  description: string,
  rayon: number (en mètres),
  rank: number (ordre dans la chasse),
  image: File
}
Response (201): { message: "Étape créée" }
```

#### Modifier une étape
```
PATCH /etape/:idChasse/:idEtape
Auth: Required
Role: PARTENAIRE
Guard: ChasseOwnershipGuard
Content-Type: multipart/form-data
Body: {
  name?: string,
  lat?: string,
  long?: string,
  address?: string,
  description?: string,
  rayon?: number,
  rank?: number,
  image?: File (optionnel)
}
Response (200): { message: "Etape updated successfully" }
```

#### Supprimer une étape
```
DELETE /etape/:idChasse/:idEtape
Auth: Required
Role: PARTENAIRE
Guard: ChasseOwnershipGuard
Response (200): (empty)
Side Effect: Supprime l'image de Cloudinary
```

#### Valider une étape
```
POST /etape/:idChasse/:idEtape/validateEtape
Auth: Required
Role: JOUEUR
Response (200): { message: "Étape validée avec succès" }
Side Effect: Crée une entrée UserChasseEtape
```

---

### 5. PARTENAIRES (`/partenaire`)

#### Obtenir les partenaires
```
GET /partenaire
Response (200): Partenaire[]
```

---

### 6. SCORES (`/score`)

#### Obtenir les scores
```
GET /score
Response (200): ScoreBoard[]
```

---

### 7. ADMIN (`/admin`)

#### Actions d'administration
Routes disponibles selon les implémentations du AdminController

---

## Flux de traitement

### Flux 1 : Connexion utilisateur

```
USER LOGIN FLOW
│
├─> 1. User envoie credentials
│   POST /connexion
│   { email: "user@example.com", password: "secret123" }
│
├─> 2. AuthService valide
│   ├─> Chercher: User.findUnique({ where: { email } })
│   ├─> Comparer password avec bcrypt
│   ├─> Si invalide → HttpException (401)
│   └─> Si valide → continue
│
├─> 3. Générer JWT Token
│   └─> jwt.sign(
│       { sub: user.id_user, partenaire: ... },
│       secret,
│       { expiresIn: '1h' }
│     )
│
├─> 4. Stocker dans Cookie
│   └─> response.cookie('access_token', token, {
│       httpOnly: true,
│       secure: (prod),
│       sameSite: 'strict',
│       maxAge: 3600000
│     })
│
└─> 5. Répondre au client
    { message: "Connexion réussie" }
```

### Flux 2 : Création d'une chasse

```
CHASSE CREATION FLOW
│
├─> 1. Partenaire crée une chasse
│   POST /chasse
│   Content-Type: multipart/form-data
│   {
│     name: "Chasse Vieille Ville",
│     localisation: "LYON",
│     etat: "ACTIVE",
│     longitude: 4.8357,
│     latitude: 45.7640,
│     occurrence: {
│       date_start: "2024-06-01",
│       date_end: "2024-06-30",
│       limit_user: 50
│     },
│     image: <File>
│   }
│
├─> 2. Vérifications
│   ├─> AuthGuard: Vérifie JWT présent
│   ├─> RolesGuard: Vérifie role === PARTENAIRE
│   ├─> StatutPartenerGuard: Vérifie partenaire.statut === ACTIVE
│   └─> FileInterceptor: Extrait l'image
│
├─> 3. Upload image vers Cloudinary
│   ├─> Convertir File en Base64
│   ├─> cloudinary.uploader.upload()
│   └─> Récupérer URL sécurisée
│
├─> 4. Valider dates
│   ├─> isValidDate(date_start)
│   ├─> isValidDate(date_end)
│   └─> Si invalide → Error 400
│
├─> 5. Créer chasse en BD
│   ChasseService.createChasse({
│     name: "Chasse Vieille Ville",
│     localisation: "LYON",
│     etat: "ACTIVE",
│     image: "https://cloudinary.com/...",
│     longitude: 4.8357,
│     latitude: 45.7640,
│     partenaire: { connect: { id_partenaire: 1 } }
│   })
│   │
│   └─> Prisma.chasse.create()
│       └─> INSERT INTO chasse (...)
│
├─> 6. Créer occurrence (édition)
│   Prisma.occurence.create({
│     date_start: "2024-06-01",
│     date_end: "2024-06-30",
│     limit_user: 50,
│     chasse: { connect: { id_chasse: <id> } }
│   })
│   │
│   └─> INSERT INTO occurence (...)
│
└─> 7. Répondre au client
    {
      message: "Chasse created",
      imageUrl: "https://cloudinary.com/..."
    }
```

### Flux 3 : Rejoindre une chasse

```
JOIN CHASSE FLOW
│
├─> 1. Joueur veut rejoindre une chasse
│   POST /chasse/:id/join
│   Auth: JWT du joueur
│
├─> 2. Vérifications
│   ├─> AuthGuard: Vérifie JWT
│   └─> Roles: Vérifie role === JOUEUR
│
├─> 3. Créer participation
│   UserChasseService.inscriptionChasse(chasseId, userId)
│   │
│   └─> Prisma.userChasse.create({
│       id_user: userId,
│       id_chasse: chasseId,
│       started_at: now(),
│       statut: "IN_PROGRESS"
│     })
│
├─> 4. Vérifier doublon
│   └─> @@unique([id_user, id_chasse])
│       (impossible de rejoindre 2x la même chasse)
│
└─> 5. Répondre
    { message: "Inscription successful" }
```

### Flux 4 : Valider une étape

```
VALIDATE ETAPE FLOW
│
├─> 1. Joueur complète une étape
│   POST /etape/:idChasse/:idEtape/validateEtape
│   Auth: JWT du joueur
│
├─> 2. Vérifications
│   ├─> AuthGuard: Vérifie JWT
│   ├─> Roles: Vérifie role === JOUEUR
│   └─> Récupérer userChasse.id_userchasse
│
├─> 3. Enregistrer progression
│   Prisma.userChasseEtape.create({
│     id_userchasse: userChasseId,
│     id_etape: etapeId,
│     reached_at: now()
│   })
│   │
│   ├─> @@unique([id_userchasse, id_etape])
│   │   (impossible de valider 2x la même étape)
│   │
│   └─> @@index([id_userchasse, id_etape])
│       (rapide à récupérer la progression)
│
└─> 5. Répondre
    { message: "Étape validée avec succès" }
```

---

## DTOs et Interfaces

### User DTOs

#### CreateUserDto
```typescript
interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: Role; // défaut: JOUEUR
}
```

#### UpdateUserDto
```typescript
interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}
```

#### CreateUserPartenairDto
```typescript
interface CreateUserPartenairDto {
  username: string;
  email: string;
  password: string;
  siret: string;
  company_name: string;
  adresse?: string;
}
```

### Chasse DTOs

#### ChasseDto
```typescript
interface ChasseDto {
  name: string;
  localisation: string;
  etat: StatutChasse; // "PENDING" | "ACTIVE"
  longitude: string;
  latitude: string;
}
```

#### ChasseOccurrenceDto
```typescript
interface ChasseOccurrenceDto extends ChasseDto {
  occurrence: string; // JSON string avec date_start, date_end, limit_user
  image: File;
}
```

### Etape DTOs

#### EtapeDto
```typescript
interface EtapeDto {
  name: string;
  lat: string;
  long: string;
  address: string;
  description: string;
  rayon: number | string;
  rank: number | string;
  image: string; // URL (remplie après upload)
}
```

### Authentication DTOs

#### ConnexionDto
```typescript
interface ConnexionDto {
  email: string;
  password: string;
}
```

---

## Guides de développement

### 1. Ajouter une nouvelle route

**Exemple : Créer une route pour obtenir le ranking des joueurs**

**Étape 1 : Créer la méthode service**
```typescript
// src/services/score.service.ts
@Injectable()
export class ScoreService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(chasseId: number): Promise<ScoreBoard[]> {
    return this.prisma.scoreBoard.findMany({
      where: { id_chasse: chasseId },
      orderBy: { score: 'desc' },
      include: { user: true }
    });
  }
}
```

**Étape 2 : Créer la méthode controller**
```typescript
// src/controllers/score.controller.ts
@Get('leaderboard/:id')
@Roles(Role.JOUEUR)
@UseGuards(AuthGuard)
async getLeaderboard(
  @Param('id') chasseId: string,
  @Res() res: Response
): Promise<Response> {
  try {
    const scores = await this.scoreService.getLeaderboard(Number(chasseId));
    return res.status(200).json(scores);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching leaderboard', error });
  }
}
```

**Étape 3 : Enregistrer dans le module**
```typescript
// src/module/score.module.ts
@Module({
  controllers: [ScoreController],
  providers: [ScoreService, PrismaService],
  exports: [ScoreService]
})
export class ScoreModule {}
```

### 2. Ajouter un Guard personnalisé

**Exemple : Guard pour vérifier que l'utilisateur est le propriétaire d'un score**

```typescript
// src/guards/scoreOwnershipGuard.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ScoreService } from 'src/services/score.service';

@Injectable()
export class ScoreOwnershipGuard implements CanActivate {
  constructor(private scoreService: ScoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    const scoreId = request.params.id;

    const score = await this.scoreService.getScoreById(Number(scoreId));

    if (score.id_user !== userId) {
      throw new ForbiddenException('You are not the owner of this score');
    }

    return true;
  }
}
```

**Utilisation:**
```typescript
@Delete(':id')
@UseGuards(AuthGuard, ScoreOwnershipGuard)
async deleteScore(@Param('id') id: string) {
  // ...
}
```

### 3. Ajouter une validation DTO

**Exemple : Valider une DTO pour créer un score**

```typescript
// src/dto/score.dto.ts
import { IsNumber, Min, Max } from 'class-validator';

export class CreateScoreDto {
  @IsNumber()
  @Min(0)
  @Max(1000)
  score: number;

  @IsNumber()
  chasseId: number;
}
```

**Utilisation:**
```typescript
@Post()
async createScore(@Body() body: CreateScoreDto) {
  // Le ValidationPipe valide automatiquement
}
```

### 4. Travailler avec Cloudinary

**Upload une image :**
```typescript
const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

const uploadResult = await cloudinary.uploader.upload(base64Image, {
  public_id: "unique_id_" + Date.now(),
  folder: "folder_name"
});

const imageUrl = uploadResult.secure_url;
```

**Supprimer une image :**
```typescript
const regex = /\/v\d+\/(.+?)(?:\?|$)/;
const match = imageUrl.match(regex);
const publicId = match ? match[1] : null;

if (publicId) {
  await cloudinary.uploader.destroy(publicId);
}
```

### 5. Générer une migration Prisma

```bash
# Après modifier schema.prisma
npm run prisma:generate    # Générer types
npm run prisma:migrate     # Créer migration
```

### 6. Déboguer avec Prisma Studio

```bash
npm run studio
# Ouvre: http://localhost:5555
```

---

## Configuration & Déploiement

### Variables d'environnement (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/lootopia
API_KEY_CLOUDINARY=your_api_key
API_KEY_CLOUDINARY_SECRET=your_secret
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

### Démarrer le serveur

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod

# Déboguer
npm run start:debug
```

### Structure Docker

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: lootopia
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin

  pgadmin:
    image: dpage/pgadmin4
    ports:
      - "5050:80"
```

---

## Endpoints Summary

| Méthode | Route | Auth | Rôle | Description |
|---|---|---|---|---|
| **POST** | `/connexion` | ❌ | - | Login |
| **GET** | `/connexion/logout` | ✅ | - | Logout |
| **POST** | `/user` | ❌ | - | Créer joueur |
| **POST** | `/user/partenaire` | ❌ | - | Créer partenaire |
| **GET** | `/user` | ✅ | ADMIN | Lister utilisateurs |
| **GET** | `/user/personnalData` | ✅ | - | Mes données |
| **PUT** | `/user/:id` | ✅ | - | Modifier utilisateur |
| **GET** | `/chasse` | ✅ | - | Lister chasses |
| **GET** | `/chasse/me` | ✅ | JOUEUR | Mes chasses |
| **GET** | `/chasse/:id` | ✅ | - | Détail chasse |
| **POST** | `/chasse` | ✅ | PARTENAIRE | Créer chasse |
| **PATCH** | `/chasse/:id` | ✅ | PARTENAIRE | Modifier chasse |
| **DELETE** | `/chasse/:id` | ✅ | PARTENAIRE | Supprimer chasse |
| **POST** | `/chasse/:id/join` | ✅ | JOUEUR | Rejoindre |
| **PATCH** | `/chasse/:id/complete` | ✅ | JOUEUR | Compléter |
| **PATCH** | `/chasse/:id/leave` | ✅ | JOUEUR | Abandonner |
| **GET** | `/etape` | ✅ | JOUEUR | Lister étapes |
| **POST** | `/etape/:id` | ✅ | PARTENAIRE | Créer étape |
| **PATCH** | `/etape/:idChasse/:idEtape` | ✅ | PARTENAIRE | Modifier étape |
| **DELETE** | `/etape/:idChasse/:idEtape` | ✅ | PARTENAIRE | Supprimer étape |
| **POST** | `/etape/:idChasse/:idEtape/validateEtape` | ✅ | JOUEUR | Valider étape |
| **GET** | `/partenaire` | ❌ | - | Lister partenaires |
| **GET** | `/score` | ✅ | - | Lister scores |

---

## Support & Ressources

- **Framework** : [NestJS Docs](https://docs.nestjs.com)
- **Database** : [Prisma Docs](https://www.prisma.io/docs)
- **API Docs** : http://localhost:3000/api (Swagger)
- **Prisma Studio** : `npm run studio`

---

**Dernière mise à jour** : 19 Mai 2026
**Version** : 1.0
