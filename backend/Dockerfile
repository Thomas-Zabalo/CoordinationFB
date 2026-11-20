# ============================================================
# Dockerfile – Backend CoordinationFB (Node.js + SQLite)
# Multi-stage : builder (compile better-sqlite3) → production
# ============================================================

# ---- Étape 1 : compilation des dépendances natives ----
FROM node:20-alpine AS builder
WORKDIR /app

# better-sqlite3 nécessite des outils de compilation natifs
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

# ---- Étape 2 : image finale légère ----
FROM node:20-alpine AS production
WORKDIR /app

# Copier uniquement les dépendances compilées et le code source
COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

# Dossier pour la base SQLite (à monter en volume)
RUN mkdir -p data

# Variables d'environnement par défaut (surchargeables via docker compose)
ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/app/data/vinyles.db \
    CORS_ORIGIN=http://localhost

EXPOSE 3000

# Utilisateur non-root
RUN addgroup -S app && adduser -S app -G app \
    && chown -R app:app /app
USER app

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000/vinyles || exit 1

CMD ["node", "src/server.js"]
