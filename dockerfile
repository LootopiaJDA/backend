# ---- STAGE 1 : Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Générer le client Prisma si présent
RUN npx prisma generate || true

# Compiler Nest.js
RUN npm run build

# ---- STAGE 2 : Production ----
FROM node:20-alpine AS production

WORKDIR /app

# Installer uniquement les dépendances de prod
COPY package*.json ./
RUN npm install --omit=dev

# Copier le build compilé
COPY --from=builder /app/dist ./dist

# Copier le schéma Prisma
COPY prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/src/main.js"]

