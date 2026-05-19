# 🏗️ Architecture Détaillée - Lootopia Backend

## Diagrammes d'architecture

### 1. Architecte générale en couches

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRÉSENTATION (HTTP REST)                        │
│  POST /chasse   GET /user   PATCH /etape/:id/validateEtape ...      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                    Express.js + NestJS (Framework)
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                         CONTRÔLEURS                                  │
│  ├─ ChasseController    ├─ UserController    ├─ EtapeController    │
│  ├─ AuthController      ├─ AdminController   ├─ ScoreController    │
│  └─ PartenaireController                                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
   ┌────▼────┐          ┌──────▼──────┐        ┌─────▼─────┐
   │  Guards  │          │   Pipes     │        │ Decorators│
   ├─────────┤          ├────────────┤        ├───────────┤
   │AuthGuard │          │Validation  │        │@Roles()   │
   │RolesGuard│          │Transform   │        │@Statuts() │
   │Ownership │          │Query       │        │@UseGuards()
   └────┬────┘          └──────┬──────┘        └─────┬─────┘
        │                       │                     │
        └───────────────────────┼─────────────────────┘
                                │
┌────────────────────────────────▼────────────────────────────────────┐
│                    SERVICES (Métier)                                │
│  ├─ AuthService        ├─ UserService       ├─ ChasseService      │
│  ├─ EtapeService       ├─ UserChasseService │─ ScoreService       │
│  ├─ PrismaService      └─ CryptoService                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
   ┌────▼─────┐          ┌──────▼────────┐     ┌────────▼──────┐
   │Repositories│         │ DTOs/Validation│    │ Data Interfaces│
   │(Optional) │         │                │    │                │
   └────┬─────┘          └──────┬────────┘     └────────┬──────┘
        │                        │                       │
        └────────────────────────┼───────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                   PRISMA ORM                                         │
│  ├─ PrismaClient       ├─ Query Builder     ├─ Relations           │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│              PostgreSQL Database (Azure)                             │
│  ├─ Users              ├─ Chasses           ├─ Etapes              │
│  ├─ Partenaires        ├─ UserChasses       ├─ ScoreBoards         │
│  └─ Messages                                                         │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Flux de requête HTTP

```
CLIENT REQUEST
│
├─> Request arrive à Express
│   ├─ CORS middleware
│   ├─ Cookie Parser middleware
│   └─ Body Parser middleware
│
├─> Route matching avec NestJS
│   └─ Trouve le bon Controller
│
├─> Exécution des Guards (ordre d'exécution)
│   1. AuthGuard   - Vérifie authentification
│   2. RolesGuard  - Vérifie rôle
│   3. Custom Guards (Ownership, etc.)
│       └─ Si une guard retourne false → 403 Forbidden
│
├─> Exécution des Pipes (Transformation & Validation)
│   1. ValidationPipe
│   └─ Si validation échoue → 400 Bad Request
│
├─> Exécution du Controller method
│   ├─ Extrait paramètres (body, params, query)
│   ├─ Appelle Service
│   └─ Gère les erreurs
│
├─> Service execute logique métier
│   ├─ Appelle Prisma pour accès données
│   ├─ Applique règles métier
│   └─ Retourne résultat ou lève exception
│
├─> Controller formatte réponse
│   └─ Status Code + Body JSON
│
└─> Response retourne au client
    ├─ Headers (CORS, Set-Cookie, etc.)
    └─ Body (JSON)
```

### 3. Cycle de vie d'une requête POST /chasse

```
┌─────────────────────────────────────────────────────────────────┐
│ USER REQUEST: POST /chasse                                      │
│ {                                                               │
│   "name": "Chasse Lyon",                                        │
│   "localisation": "LYON",                                       │
│   "longitude": 4.8357,                                          │
│   "latitude": 45.7640,                                          │
│   "etat": "ACTIVE",                                             │
│   "occurrence": "{...}",                                        │
│   "image": <binary>                                             │
│ }                                                               │
└────────────────────┬──────────────────────────────────────────┘
                     │
    ┌────────────────▼─────────────────┐
    │ NestJS Request Pipeline Begins   │
    └────────────────┬─────────────────┘
                     │
    ┌────────────────▼──────────────────────────────────┐
    │ 1. Middleware & Pipes                            │
    │    ├─ CORSMiddleware                             │
    │    ├─ BodyParserMiddleware                       │
    │    ├─ FileInterceptor (extrait file)             │
    │    └─ ValidationPipe                             │
    │        ├─ Valide body contre ChasseOccurrenceDto│
    │        └─ Transform (enableImplicitConversion)   │
    └────────────────┬──────────────────────────────────┘
                     │
         ┌───────────▼────────────┐
         │ 2. Route Resolution    │
         │    Trouve Controller   │
         │    @Controller('chasse')
         └───────────┬────────────┘
                     │
    ┌────────────────▼──────────────────────────────────┐
    │ 3. Decorator Processing                          │
    │    @Roles(Role.PARTENAIRE)                       │
    │    └─> Stocke metadata: roles = [PARTENAIRE]     │
    │                                                   │
    │    @UseGuards(StatutPartenerGuard, RolesGuard)   │
    │    └─> Prépare guards pour exécution             │
    │                                                   │
    │    @UseInterceptors(FileInterceptor('image'))    │
    │    └─> Intercepteur fichier activé               │
    └────────────────┬──────────────────────────────────┘
                     │
    ┌────────────────▼──────────────────────────────────┐
    │ 4. Guard Execution (ORDRE IMPORTANT)             │
    │                                                   │
    │    Guard 1: AuthGuard                            │
    │    ├─> Récupère cookie 'access_token'           │
    │    ├─> Valide signature JWT                     │
    │    ├─ Extrait payload: { sub, partenaire }      │
    │    └─> Ajoute à req.user                         │
    │                                                   │
    │    Guard 2: StatutPartenerGuard                  │
    │    ├─> Vérifie req.user.partenaire existe       │
    │    ├─> Récupère partenaire: Partenaire.findUnique │
    │    ├─> Vérifie statut === ACTIVE                │
    │    └─> Si non → Throw ForbiddenException        │
    │                                                   │
    │    Guard 3: RolesGuard                           │
    │    ├─> Récupère roles requis du décorateur      │
    │    ├─> Récupère role utilisateur: req.user.role│
    │    ├─> Vérifie req.user.role IN [PARTENAIRE]   │
    │    └─> Si non → Throw ForbiddenException        │
    └────────────────┬──────────────────────────────────┘
                     │
    ┌────────────────▼──────────────────────────────────┐
    │ 5. Controller Method Execution                   │
    │                                                   │
    │    async createChasse(                           │
    │      @Body() body: ChasseOccurrenceDto,         │
    │      @UploadedFile() image: any,                │
    │      @Req() req: RequestWithUser,               │
    │      @Res() res: Response                        │
    │    )                                             │
    │                                                   │
    │    ├─> body = validé et transformé              │
    │    ├─> image = extrait du multipart             │
    │    ├─> req.user = authentifié + roles           │
    │    └─> res = réponse Express                    │
    └────────────────┬──────────────────────────────────┘
                     │
    ┌────────────────▼──────────────────────────────────┐
    │ 6. Business Logic Execution                      │
    │                                                   │
    │    ├─> Convertir image en Base64                │
    │    ├─> Upload vers Cloudinary                    │
    │    │   ├─ POST https://api.cloudinary.com/...   │
    │    │   └─> Retour: { secure_url, public_id }   │
    │    │                                             │
    │    ├─> Valider dates (isValidDate)              │
    │    │                                             │
    │    ├─> ChasseService.createChasse()             │
    │    │   ├─ PrismaService.chasse.create({         │
    │    │   │   name: "Chasse Lyon",                 │
    │    │   │   localisation: "LYON",                │
    │    │   │   image: "https://cloudinary.com/...",│
    │    │   │   longitude: 4.8357,                   │
    │    │   │   latitude: 45.7640,                   │
    │    │   │   etat: "ACTIVE",                      │
    │    │   │   partenaire: {                        │
    │    │   │     connect: { id_partenaire: 1 }     │
    │    │   │   }                                     │
    │    │   │ })                                      │
    │    │   │                                         │
    │    │   └─ Execute: INSERT INTO chasse (...)     │
    │    │      └─> Database retourne: chasse créée   │
    │    │                                             │
    │    └─> Créer occurrence (édition)               │
    │        └─ PrismaService.occurence.create({      │
    │             chasse_id: <id>,                    │
    │             date_start, date_end, limit_user    │
    │           })                                     │
    └────────────────┬──────────────────────────────────┘
                     │
    ┌────────────────▼──────────────────────────────────┐
    │ 7. Response Formatting                           │
    │                                                   │
    │    res.status(201).send({                        │
    │      message: "Chasse created",                  │
    │      imageUrl: "https://cloudinary.com/..."      │
    │    })                                            │
    └────────────────┬──────────────────────────────────┘
                     │
    ┌────────────────▼──────────────────────────────────┐
    │ 8. Response Sent to Client                       │
    │                                                   │
    │    HTTP 201 Created                              │
    │    {                                             │
    │      message: "Chasse created",                  │
    │      imageUrl: "https://cloudinary.com/..."      │
    │    }                                             │
    └────────────────┬──────────────────────────────────┘
                     │
                     └─▶ CLIENT RECEIVES RESPONSE
```

### 4. Authentification JWT Flow

```
┌──────────────────────────────────────────────────────────────┐
│ AUTHENTICATION WORKFLOW                                      │
└──────────────────────────────────────────────────────────────┘

STEP 1: LOGIN
┌────────────────────────────────────────────────────────────┐
│ POST /connexion                                            │
│ {                                                          │
│   email: "john@example.com",                              │
│   password: "secret123"                                    │
│ }                                                          │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │ AuthService.login()      │
         │                          │
         ├─> User.findUnique({      │
         │     where: { email }     │
         │   })                     │
         │                          │
         ├─> Récupère utilisateur   │
         │   {                      │
         │     id_user: 42,         │
         │     email: "john@...",   │
         │     password: "$2b$..."  │
         │     role: "PARTENAIRE",  │
         │     partenerId: 7        │
         │   }                      │
         │                          │
         ├─> Compare password       │
         │   bcrypt.compare(        │
         │     "secret123",         │
         │     "$2b$..."            │
         │   ) ===== true ✅        │
         │                          │
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────┐
         │ Générer JWT Token        │
         │                          │
         │ jwt.sign(                │
         │   {                      │
         │     sub: 42,             │
         │     partenaire: {        │
         │       id_partenaire: 7   │
         │     }                    │
         │   },                     │
         │   process.env.JWT_SECRET,
         │   {                      │
         │     expiresIn: '1h'      │
         │   }                      │
         │ )                        │
         │                          │
         │ Token généré:            │
         │ eyJhbGciOiJIUzI1NiIs... │
         │                          │
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────────────────────────┐
         │ Stocker dans Cookie                         │
         │                                             │
         │ response.cookie('access_token', token, {   │
         │   httpOnly: true,    // JS ne peut pas    │
         │   secure: (prod),    // HTTPS seulement   │
         │   sameSite: 'strict',// CSRF protection   │
         │   maxAge: 3600000,   // 1 heure           │
         │   path: '/'          // Tous les chemins  │
         │ })                                         │
         │                                            │
         │ Header Response:                           │
         │ Set-Cookie: access_token=eyJ...;           │
         │   HttpOnly; Secure; SameSite=Strict; ...  │
         │                                            │
         └───────────┬──────────────────────────────────┘
                     │
         ┌───────────▼──────────────────────────────────┐
         │ Response au Client                          │
         │                                             │
         │ HTTP 200 OK                                │
         │ {                                          │
         │   message: "Connexion réussie"            │
         │ }                                          │
         │                                            │
         │ Cookie stocké automatiquement par browser   │
         └───────────┬──────────────────────────────────┘
                     │
                 ✅ AUTHENTIFIÉ

STEP 2: AUTHENTICATED REQUEST
┌────────────────────────────────────────────────────────────┐
│ GET /chasse/me                                            │
│ Headers: Cookie: access_token=eyJ...                     │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────▼──────────────────────────────────┐
         │ AuthGuard.canActivate()                     │
         │                                             │
         ├─> Récupère cookie                          │
         │   req.cookies['access_token']              │
         │   = "eyJ..."                               │
         │                                             │
         ├─> Valide JWT                               │
         │   jwt.verify(token, secret)                │
         │                                             │
         ├─> Décrypte payload                         │
         │   {                                        │
         │     sub: 42,                              │
         │     partenaire: { id_partenaire: 7 },    │
         │     iat: 1234567890,                      │
         │     exp: 1234571490                       │
         │   }                                        │
         │                                             │
         ├─> Ajoute à request                         │
         │   req.user = payload                       │
         │   req.user.sub = 42                        │
         │   req.user.partenaire = ...                │
         │                                             │
         └───────────┬──────────────────────────────────┘
                     │
         ┌───────────▼──────────────────────────────────┐
         │ Request continue normal                     │
         │ req.user disponible dans Controller         │
         │                                             │
         │ @Req() req: RequestWithUser                │
         │ const userId = req.user.sub  // = 42      │
         │                                             │
         └───────────┬──────────────────────────────────┘
                     │
                 ✅ AUTORISÉ


STEP 3: LOGOUT
┌────────────────────────────────────────────────────────────┐
│ GET /connexion/logout                                     │
│ (avec Cookie: access_token=eyJ...)                        │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │ AuthGuard valide token   │
         └───────────┬──────────────┘
                     │
         ┌───────────▼──────────────────────────────────┐
         │ Logout action                               │
         │                                             │
         │ res.clearCookie('access_token')            │
         │                                             │
         │ Response:                                  │
         │ Set-Cookie: access_token=; Max-Age=0; ... │
         │                                             │
         └───────────┬──────────────────────────────────┘
                     │
                 ✅ DÉCONNECTÉ
```

### 5. Structure Module NestJS

```
AppModule (Root)
│
├─ imports:
│  ├─ UserModule
│  │  ├─ controllers: [UserController]
│  │  ├─ providers: [UserService, PrismaService]
│  │  └─ exports: [UserService]
│  │
│  ├─ AuthModule
│  │  ├─ controllers: [AuthController]
│  │  ├─ providers: [AuthService, PrismaService]
│  │  └─ exports: [AuthService]
│  │
│  ├─ ChasseModule
│  │  ├─ controllers: [ChasseController]
│  │  ├─ providers: [ChasseService, UserChasseService, PrismaService]
│  │  └─ exports: [ChasseService, UserChasseService]
│  │
│  ├─ EtapeModule
│  │  ├─ controllers: [EtapeController]
│  │  ├─ providers: [EtapeService, UserChasseService, PrismaService]
│  │  └─ exports: [EtapeService]
│  │
│  ├─ AdminModule
│  │  ├─ controllers: [AdminController]
│  │  ├─ providers: [AdminService, PrismaService]
│  │  └─ exports: [AdminService]
│  │
│  ├─ PartenaireModule
│  │  ├─ controllers: [PartenaireController]
│  │  ├─ providers: [PartenaireService, PrismaService]
│  │  └─ exports: [PartenaireService]
│  │
│  └─ ScoreModule
│     ├─ controllers: [ScoreController]
│     ├─ providers: [ScoreService, PrismaService]
│     └─ exports: [ScoreService]
│
└─ Providers (Global):
   ├─ PrismaService (partagé dans tous les modules)
   ├─ CryptoService (service utilitaire)
   └─ Custom Guards / Decorators (disponibles partout)
```

### 6. Gestion des erreurs

```
REQUEST ERROR HANDLING FLOW

┌─────────────────────────────────────┐
│ Erreur survient dans Controller     │
│ ou Service                          │
└─────────────┬───────────────────────┘
              │
    ┌─────────▼────────────┐
    │ try/catch bloc       │
    │                      │
    │ catch (error) {      │
    │   res.status(500)    │
    │   .send({            │
    │     message: "...",  │
    │     error: error     │
    │   })                 │
    │ }                    │
    │                      │
    │ Ou Throw Exception:  │
    │ throw new            │
    │ HttpException(...)   │
    └─────────┬────────────┘
              │
    ┌─────────▼────────────────────────────────────┐
    │ NestJS Exception Filter (global)             │
    │                                              │
    │ Si HttpException                            │
    │ ├─> Extrait status + message                │
    │ └─> Retourne response formatée              │
    │                                              │
    │ Si Erreur non gérée                         │
    │ └─> Retourne 500 Internal Server Error      │
    └─────────┬────────────────────────────────────┘
              │
    ┌─────────▼────────────────────────────────────┐
    │ Response Sent                                │
    │                                              │
    │ HTTP 500                                    │
    │ {                                           │
    │   message: "Error updating chasse",         │
    │   error: {...}                              │
    │ }                                           │
    │                                             │
    │ Ou HTTP 400/401/403 selon type exception    │
    └─────────────────────────────────────────────┘
```

---

## Patterns et Bonnes Pratiques

### 1. Service Dependency Injection

```typescript
// ✅ BON
@Injectable()
export class ChasseService {
  constructor(private prisma: PrismaService) {}
  
  async getChasse(id: number) {
    return this.prisma.chasse.findUnique({ where: { id_chasse: id } });
  }
}

// ❌ MAUVAIS (créer instance manuellement)
export class ChasseService {
  private prisma = new PrismaClient();
  // Génère plusieurs instances, fuites mémoire
}
```

### 2. Gestion des Erreurs

```typescript
// ✅ BON
async getChasse(id: number) {
  const chasse = await this.prisma.chasse.findUnique({
    where: { id_chasse: id }
  });
  
  if (!chasse) {
    throw new HttpException('Chasse not found', HttpStatus.NOT_FOUND);
  }
  
  return chasse;
}

// ❌ MAUVAIS (erreur non gérée)
async getChasse(id: number) {
  return this.prisma.chasse.findUnique({
    where: { id_chasse: id }
  }); // Peut retourner null sans message clair
}
```

### 3. Validation DTO

```typescript
// ✅ BON - Validation automatique
@Post()
async createUser(@Body() body: CreateUserDto) {
  // body est automatiquement validé
  return this.userService.create(body);
}

// ❌ MAUVAIS - Validation manuelle
@Post()
async createUser(@Body() body: any) {
  if (!body.email) throw new Error('Email required');
  if (!body.password) throw new Error('Password required');
  // Répétitif et fragile
}
```

### 4. Async/Await

```typescript
// ✅ BON
async getChasses() {
  return await this.prisma.chasse.findMany();
}

// ❌ MAUVAIS (Promise confusion)
async getChasses() {
  return this.prisma.chasse.findMany(); // Pas await -> retourne Promise brute
}
```

---

**Última atualización**: 19 de Mayo de 2026
