# 🏃 Run Together

Run Together est une application privée permettant de suivre, visualiser et évaluer ses courses de running.
Elle propose un dashboard moderne pour gérer ses sessions, analyser ses performances et garder la motivation
<img width="1893" height="905" alt="image" src="https://github.com/user-attachments/assets/aac9ccb1-7ea7-4409-ac05-bb31e239cf9d" />
<img width="1916" height="905" alt="image" src="https://github.com/user-attachments/assets/12c623bd-55a4-4eac-a663-7e0a4616a3c2" />


## 🚀 Stack Technique
Ce projet utilise un ensemble de technologies modernes pour offrir une expérience fluide et performante :
Next.js → Framework React pour une application rapide et évolutive

- shadcn/ui → Composants UI élégants et personnalisables
- Prisma → ORM pour gérer la base de données simplement
- nuqs → Gestion des paramètres d’URL type-safe
- better-auth → Système d’authentification moderne et sécurisé
- up-fetch → Client HTTP simple et typé pour les appels API
- Zustand → Gestion d’état légère et efficace
- react-hook-form → Gestion de formulaires performante et flexible

## ✨ Fonctionnalités
- 🔐 Application privée : accès sécurisé avec authentification
- 📊 Dashboard : visualisation des courses (date, durée, distance, vitesse, etc.)
- ⚡ UI moderne : interface propre grâce à shadcn/ui
- 🛠️ Stack typée & scalable : Prisma, nuqs et Zustand pour un dev plus productif

## 📦 Installation
1. Cloner le projet
```bash
git clone https://github.com/ton-compte/run-together.git
cd run-together
```

2. Installer les dépendances
```bash
pnpm install
```

3. Configurer l’environnement
Créer un fichier .env à la racine avec les variables nécessaires :
```bash
DATABASE_URL=

BETTER_AUTH_SECRET=
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Générer le client Prisma
```bash
pnpm dlx prisma generate
```

5. Lancer le projet en local
```bash
pnpm run dev
```
L’application sera disponible sur `http://localhost:3000`

📜 Licence
Projet Run Together – usage personnel / privé.
