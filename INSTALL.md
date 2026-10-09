# Installation

Ce guide explique comment installer et lancer CoordinationFB (front-end React + Vite, API Express, base SQLite) en local.

## Prérequis

- Node.js 20 ou plus
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
| `frontend/.env` | `VITE_API_URL` | `http://localhost:3000` | Adresse de l'API |

## 4. Initialiser la base de données

```bash
cd backend
npm run db:init
cd ..
```

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

## Dépannage

| Symptôme | Solution |
|---|---|
| `command not found: node` | Installer Node.js 20 ou plus, puis rouvrir le terminal |
| `EADDRINUSE` | Fermer le processus qui utilise le port, ou changer `PORT` dans `backend/.env` |
| Erreur `CORS` dans le navigateur | Vérifier que l'API autorise l'origine `http://localhost:5173` |
| `Network Error` côté front | Démarrer l'API et vérifier `VITE_API_URL` dans `frontend/.env` |
| `no such table: vinyles` | Lancer `npm run db:init` dans `backend` |

Après toute modification d'un fichier `.env`, redémarrer le serveur concerné.