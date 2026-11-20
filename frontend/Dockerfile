# ============================================================
# Dockerfile – Frontend CoordinationFB (Vite + React)
# Multi-stage : builder Node.js → serveur Nginx statique
# ============================================================

# ---- Étape 1 : build Vite ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# L'URL de l'API est injectée au moment du build (variable Vite)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Étape 2 : serveur Nginx léger ----
FROM nginx:1.27-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
