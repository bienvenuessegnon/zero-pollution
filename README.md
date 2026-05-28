# Zéro Pollution Bénin — Plateforme Citoyenne & PWA

Une application web progressive (PWA) et full-stack intégrée, conçue sous React (Vite) et Node.js (Express), optimisée pour les débits mobiles béninois et dotée d'un triage d'incidents environnementaux propulsé par l'IA Gemini.

Ce guide complet vous explique pas-à-pas comment faire tourner l'application localement sur votre ordinateur, l'importer sur GitHub, puis la déployer en ligne sur Vercel (ou autre hébergeur).

---

## 🚀 Étape 1 : Installation et Lancement en Local

Lors du téléchargement de l'application depuis AI Studio, les modules de code tiers (les dépendances) ne sont pas inclus par défaut dans l'archive afin d'en optimiser le poids. Vous **devez impérativement les installer** manuellement.

### 1. Extraction et ouverture du terminal
1. Décompressez l'archive téléchargée (le dossier `.zip`) sur votre ordinateur.
2. Ouvrez un terminal de commande orienté précisément dans ce dossier.

### 2. Installation de toutes les dépendances (Crucial)
Tapez la commande suivante pour télécharger automatiquement toutes les dépendances définies dans le projet (React, Express, Tailwind, Leaflet, etc.) :

```bash
npm install
```

### 3. Lancement de l'application
Démarrez le serveur de développement en local avec :

```bash
npm run dev
```

Une fois démarré, ouvrez votre navigateur internet sur **[http://localhost:3000](http://localhost:3000)**.

---

## ⚠️ Solution en cas de conflits (« Port 3000 déjà utilisé »)

Le port par défaut de l'application est le **3000**. Si vous avez déjà un autre projet qui tourne sur ce port, Express lèvera une erreur `EADDRINUSE` empêchant le serveur de s'activer.

Pour changer de port instantanément au démarrage, utilisez les directives suivantes dans votre terminal :

*   **Sur macOS ou Linux :**
    ```bash
    PORT=3005 npm run dev
    ```
*   **Sur Windows (PowerShell) :**
    ```powershell
    $env:PORT="3005"; npm run dev
    ```
*   **Sur Windows (Invite de commandes CMD standard) :**
    ```cmd
    set PORT=3005 && npm run dev
    ```

*(Dans cet exemple, l'application s'ouvrira sans conflit sur `http://localhost:3005`)*.

---

## 🔑 Variables d'environnement (.env)

Pour exploiter l'API de triage intelligente Gemini en direct, renommez ou copiez le fichier `.env.example` présent à la racine en un fichier nommé précisément `.env` :

```env
GEMINI_API_KEY="VOTRE_CLE_API_GEMINI_REELLE"
APP_URL="http://localhost:3000"
```

*Note : Si aucune clé n'est fournie, pas de panique ! L'application basculera de manière transparente sur un simulateur de triage linguistique local ultra-performant, pour que vous puissiez tester le parcours utilisateur sans configuration externe obligatoire.*

---

## 🗂️ Étape 2 : Envoyer le Code sur GitHub

Pour sauvegarder votre code de manière sécurisée et rendre possible le déploiement sur Vercel, vous devez initier un dépôt Git et l'envoyer sur votre compte GitHub.

1.  Connectez-vous à votre compte [GitHub](https://github.com) et créez un nouveau dépôt public ou privé vide (ne cochez ni README, ni .gitignore lors de la création).
2.  Dans le terminal de votre projet local, lancez la séquence de commandes suivante :

```bash
# Initialiser Git localement
git init

# Indexer tous vos fichiers de code (le dossier node_modules est déjà ignoré grâce au .gitignore)
git add .

# Enregistrer les modifications
git commit -m "Initialisation de l'application Zéro Pollution Bénin"

# Renommer la branche principale en 'main'
git branch -M main

# Connecter votre dépôt local à votre dépôt GitHub distant
# (Remplacez l'URL ci-dessous par celle fournie par GitHub lors de la création)
git remote add origin https://github.com/VOTRE_PSEUDO/VOTRE_REPOSIT_NAME.git

# Envoyer le code sur GitHub
git push -u origin main
```

---

## ☁️ Étape 3 : Déploiement en Ligne (Hosting)

Deux types d'hébergements s'offrent à vous selon la structure de diffusion que vous choisissez d'activer :

### Option A : Déploiement sur Vercel (Recommandé pour sa gratuité et simplicité)

Vercel est la plateforme reine pour l'hébergement d'applications frontales comme les Single Page Applications (SPA).

Bien que Vercel ne fasse pas tourner de serveurs Node.js Express persistants classiques en continu en arrière-plan, **nous avons conçu l'architecture de Zéro Pollution Bénin pour être parfaitement résiliente** :
En absence de serveur Node actif, le code frontal prend automatiquement le relais en exécutant toutes les fonctionnalités (le triage d'incidents, la simulation d'expert, l'analyse de gravité, la cartographie interactive Leaflet dynamique, et la sauvegarde locale PWA) directement dans le navigateur du citoyen !

#### Comment déployer sur Vercel en 2 minutes :
1.  Rendez-vous sur [Vercel.com](https://vercel.com) et créez un compte gratuit.
2.  Cliquez sur **Add New** puis **Project**.
3.  Connectez votre compte GitHub et cliquez sur **Import** en face de votre dépôt `Zéro Pollution Bénin`.
4.  Vercel détectera automatiquement l'usage de Vite. Laissez les configurations par défaut :
    *   **Framework Preset :** Vite
    *   **Build Command :** `npm run build`
    *   **Output Directory :** `dist`
5.  Cliquez sur **Deploy** ! Votre application est en ligne sous une adresse sécurisée en `https`.

---

### Option B : Déploiement Full-Stack Complet (avec Serveur Node Express permanent)

Si vous souhaitez héberger à la fois l'application frontale ET l'API Node Express pour utiliser des requêtes Gemini server-side, vous devez utiliser un hébergeur d'applications Cloud persistant :

*   **Render.com** (Gratuit/Abordable)
*   **Railway.app** (Simple et Rapide)

#### Processus général :
1.  Créez un compte sur [Render](https://render.com).
2.  Créez un nouveau **Web Service** et connectez votre dépôt GitHub.
3.  Définissez les commandes suivantes :
    *   **Runtime :** Node
    *   **Build Command :** `npm run build`
    *   **Start Command :** `npm run start` (Exécute notre production build `dist/server.cjs` compilée spécifiquement d’un seul bloc CJS).
4.  Dans l'onglet **Environment Variables**, ajoutez votre clé `GEMINI_API_KEY` pour propulser le modèle d'intelligence en temps réel.
5.  Validez le déploiement. Votre solution full-stack complète est fonctionnelle !
# zero-pollution
