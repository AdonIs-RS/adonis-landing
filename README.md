# Adonis — Landing page

## Structure
- `public/index.html` + `styles.css` + `script.js` : la landing page publique.
- `public/admin.html` + `admin.js` : la page d'administration pour modifier les textes et voir les leads.
- `data/content.json` : tous les textes de la landing (peut aussi être édité à la main).
- `data/leads.json` : les leads collectés par le formulaire.
- `server.js` : le backend (Express).

## Lancer en local
```
npm install
npm start
```
Puis ouvre http://localhost:3000 (landing) et http://localhost:3000/admin.html (admin).

Mot de passe admin par défaut : `adonis2026`
(à changer via la variable d'environnement `ADMIN_PASSWORD` en production)

## Modifier le contenu
Va sur `/admin.html`, entre le mot de passe, modifie les champs, clique sur "Enregistrer".
Rafraîchis la page publique pour voir les changements.

Avant de lancer, remplace le lien Calendly placeholder dans l'admin
(`https://calendly.com/votre-lien/demo-adonis`) par ton vrai lien Calendly.

## Déployer pour avoir une URL publique
Ce projet a un vrai backend (Node/Express), donc il faut un hébergeur qui exécute du code,
pas un simple hébergeur de fichiers statiques (Netlify/Vercel statique ne suffira pas pour l'API).

Options simples et gratuites :
- **Render.com** : "New Web Service" → connecter le dossier ou un repo GitHub →
  Build command: `npm install` → Start command: `npm start`.
- **Railway.app** : "New Project" → "Deploy from GitHub repo" ou upload direct.

Dans les deux cas, pense à définir la variable d'environnement `ADMIN_PASSWORD`
dans les réglages du service pour ne pas garder le mot de passe par défaut.

## Pour le rendu J2 (Tally)
Une fois déployé : dépose l'URL publique de la landing + un export PDF de la page
(impression en paysage, Ctrl+P / Cmd+P) dans le formulaire Tally.
