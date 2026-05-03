# Turtle Safe

## Présentation du projet

**Turtle Safe** est un site web éco-conçu permettant de signaler rapidement des tortues marines en danger ou des zones sensibles, comme des nids exposés.

Le projet a été réalisé dans le cadre du mini-projet **Numérique Durable — TI616** à l’EFREI.  
L’objectif est de proposer un service utile, simple, rapide et sobre, tout en respectant les principes du Green IT.

Le site permet notamment :
- de créer un compte utilisateur ;
- de se connecter et se déconnecter ;
- de publier un signalement ;
- de consulter les signalements existants ;
- de supprimer un signalement ;
- d’utiliser un rôle administrateur pour gérer certains signalements.

---

## URL du site déployé

Le site est accessible en ligne ici : https://projet-numerique-durable-s6-efrei.onrender.com/apropos.html

---

## Comment faire tourner notre code en local ? 
dans le terminal, quand vous ouvrez sur VsCode par exemple : 
1. cd ProjetNumeriqueDurableFINAL
2. npm install
3. npm start

Le site sera ensuite accessible en local à l’adresse : http://localhost:3000 

--- 

## Membres de l’équipe

| Membre | Rôle principal |
|---|---|
| Chloé Hurbain | Front-end, design, rapport, présentation ppt |
| Ivana Garcia | Back-end, routes Express, authentification |
| Giulio Torchia | Aide front-end, aide rapport |
| Henri Waguet | Base de données SQLite, modèle de données |

---

## Fonctionnalités principales

| Fonctionnalité | Statut |
|---|---|
| Page d’accueil | Réalisé |
| Création de compte | Réalisé |
| Connexion utilisateur | Réalisé |
| Déconnexion | Réalisé |
| Formulaire de signalement | Réalisé |
| Liste des signalements | Réalisé |
| Suppression d’un signalement | Réalisé |
| Rôle administrateur | Réalisé |
| Modification d’un signalement | Non réalisé |
| Upload de photos | Non réalisé volontairement |
| Carte interactive | Non réalisé volontairement |

Certaines fonctionnalités comme l’ajout de photos ou une carte interactive n’ont pas été intégrées afin de limiter le poids du site, le nombre de requêtes et l’impact environnemental.

---

## Stack technique

| Élément | Technologie utilisée | Justification |
|---|---|---|
| Front-end | HTML5, CSS3, JavaScript natif | Pas de framework lourd, site plus léger |
| Back-end | Node.js avec Express | Simple, rapide à mettre en place, adapté au MVP |
| Base de données | SQLite | Base légère, fichier unique, pas de serveur BDD séparé |
| Authentification | express-session | Gestion simple des sessions utilisateur |
| Sécurité mot de passe | bcryptjs | Hash des mots de passe |
| Hébergement | Render | Déploiement public d’une application Node.js |
| Versioning | GitHub | Centralisation du code et déploiement |

---

## Choix Green IT

Le site a été conçu avec une logique de sobriété numérique :

- pas de framework front-end lourd comme React, Vue ou Angular ;
- pas de vidéo ;
- pas d’animation inutile ;
- une seule image principale au format WebP ;
- JavaScript limité aux fonctionnalités nécessaires ;
- interface simple et lisible ;
- base SQLite légère ;
- peu de requêtes HTTP ;
- pages très légères.

Résultats obtenus sur la version optimisée :

| Indicateur | Résultat |
|---|---|
| Poids moyen des pages | Environ 39,75 Ko |
| Nombre moyen de requêtes | Environ 3,75 |
| Score Lighthouse moyen | Environ 99/100 |
| Score EcoIndex moyen | Environ 93,75/100 |
| Website Carbon Calculator | Moins de 0,01 g CO₂ par visite |
| Note carbone | A+ |

---

## Structure du projet

```txt
ProjetNumeriqueDurableFINAL/
├── db/
│   ├── database.js
│   └── turtle_safe.sqlite
│
├── routes/
│   ├── auth.js
│   ├── signalements.js
│   └── admin.js
│
├── accueil.html
├── apropos.html
├── login.html
├── signal_formulaire.html
├── signalements.html
│
├── app.js
├── login.js
├── signalement.js
├── signalements.js
│
├── style.css
├── logo-tortue.webp
│
├── server.js
├── creer-admin.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
