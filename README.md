# Zéro Pollution Bénin

Application citoyenne de signalement d'incidents environnementaux au Bénin : carte, fil d'actualité, validation communautaire et espace d'administration. Conçue comme une application web progressive (PWA).

*A civic PWA for reporting environmental incidents in Benin, with a map, a public feed and an admin view.*

**Démo :** [https://zero-pollution.vercel.app](https://zero-pollution.vercel.app)

## Fonctionnalités

- signalement d'un incident (catégorie, gravité, lieu, photo, description)
- carte et fil d'actualité des signalements
- confirmation ou signalement comme abus par d'autres citoyens
- suivi du statut (en attente, vérification, intervention, résolu)
- statistiques
- espace d'administration protégé
- installation comme PWA
- persistance via Firebase, avec repli sur le stockage local du navigateur

Un triage automatique de la gravité peut s'appuyer sur une clé `GEMINI_API_KEY`. Sans cette clé, un parcours de démonstration reste utilisable.

## Stack

React, TypeScript, Vite, Tailwind CSS, Leaflet, Firebase, Express (serveur de développement et d'API).

## Lancer le projet

Prérequis : Node.js.

```bash
cp .env.example .env
npm install
npm run dev
```

L'application est servie sur [http://localhost:3000](http://localhost:3000). Le port se change avec la variable `PORT`.

## Structure

```text
src/components/   carte, fil, formulaire, statistiques, administration
src/utils/        Firebase et données d'exemple
public/           manifeste PWA et service worker
server.ts         serveur Express
```

## Auteur

[Bienvenu ESSEGNON](https://github.com/bienvenuessegnon)
