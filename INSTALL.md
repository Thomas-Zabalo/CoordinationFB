# Installation

Ce guide explique comment installer et lancer CoordinationFB (front-end React + Vite, API Express, base SQLite) en local.

## Prérequis

- Node.js 20.19 ou plus (22 LTS recommandée)
- npm
- Git

Vérifier les versions :

```bash
node --version
npm --version
git --version
```

## 1. Récupérer le projet

```bash
git clone https://github.com/Thomas-Zabalo/CoordinationFB.git
cd CoordinationFB
```

## 2. Installer les dépendances

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 3. Configurer l'environnement

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

| Fichier | Variable | Valeur | Rôle |
|---|---|---|---|
| `backend/.env` | `PORT` | `3000` | Port de l'API |
| `backend/.env` | `DB_PATH` | `./data/vinyles.db` | Emplacement de la base SQLite |
| `backend/.env` | `CORS_ORIGIN` | `http://localhost:5173` | Origine du front-end autorisée par l'API |
| `frontend/.env` | `VITE_API_URL` | `http://localhost:3000` | Adresse de l'API |

## 4. Initialiser la base de données & Migrations Flyway

La structure de la base de données est gérée via **Flyway** (fichiers SQL versionnés dans `backend/src/db/migrations/`).
L'API applique automatiquement les migrations en attente au démarrage.

Pour exécuter ou inspecter les migrations sans lancer le serveur :

```bash
cd backend

# Appliquer les migrations en attente (runner Node rapide)
npm run db:migrate

# Ou via la CLI Flyway
npm run flyway:migrate

# Consulter l'historique et l'état des migrations
npm run flyway:info

cd ..
```

### Ajouter une nouvelle migration pour l'équipe

1. Créez un nouveau fichier dans `backend/src/db/migrations/` en respectant la convention Flyway :
   `V2__description_en_minuscules.sql` (ex: `V2__ajouter_champ_vitesse.sql`).
2. Rédigez le script SQL standard (`ALTER TABLE`, `CREATE TABLE`, `CREATE INDEX`, etc.).
3. Lancez `npm run db:migrate` (ou redémarrez l'API) : la migration est automatiquement appliquée et historisée dans la table `flyway_schema_history`.

## 5. Lancer l'application

Ouvrir deux terminaux à la racine du projet.

Terminal 1, API :

```bash
cd backend
npm run dev
```

Terminal 2, front-end :

```bash
cd frontend
npm run dev
```

## 6. Vérifier l'installation

| Service | Adresse | Résultat attendu |
|---|---|---|
| Front-end | http://localhost:5173 | L'interface s'affiche |
| API | http://localhost:3000/vinyles | Une liste JSON (vide au départ) |

## 7. Lancer les tests et le linter

Dans `backend` comme dans `frontend` :

```bash
npm test
npm run lint
```

Les tests du backend utilisent une base SQLite en mémoire : ils ne touchent pas à `data/vinyles.db`.

## Dépannage

| Symptôme | Solution |
|---|---|
| `command not found: node` | Installer Node.js 20.19 ou plus, puis rouvrir le terminal |
| `EADDRINUSE` | Fermer le processus qui utilise le port, ou changer `PORT` dans `backend/.env` |
| Erreur `CORS` dans le navigateur | Vérifier que `CORS_ORIGIN` dans `backend/.env` correspond à l'adresse du front-end |
| `Network Error` côté front | Démarrer l'API et vérifier `VITE_API_URL` dans `frontend/.env` |
| `no such table: vinyles` | Redémarrer l'API, ou lancer `npm run db:init` dans `backend` |

Après toute modification d'un fichier `.env`, redémarrer le serveur concerné.