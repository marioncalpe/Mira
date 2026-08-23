# 🌸 Mira — V1

Mira est une application mobile Angular de suivi de sorties pour les personnes souffrant d'anxiété sociale ou d'agoraphobie. Elle permet de planifier, noter et analyser ses sorties du quotidien, avec un système de succès pour encourager la progression.

🔗 **Application en ligne** : [marioncalpe.github.io/Mira](https://marioncalpe.github.io/Mira)

---

## 📱 Pages de l'application

| Page | Description |
|------|-------------|
| **Onboarding** | Présentation de l'application au premier lancement (5 slides) |
| **Home** | Tableau de bord avec stats, carte SOS, sorties récentes, badges et notes |
| **Calendrier** | Planification et consultation des sorties par mois |
| **SOS** | Conseils anti-crise d'anxiété + exercice de cohérence cardiaque guidé |
| **Progression** | Statistiques détaillées, graphique mensuel navigable et objectifs personnels |
| **Succès** | Collection de 40 badges à débloquer selon sa progression |
| **Paramètres** | Thème, sauvegarde, import, suppression des données et notifications |

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── models/               # Interfaces TypeScript
│   │   │   ├── sortie.model.ts
│   │   │   ├── badge.model.ts
│   │   │   ├── objectif.model.ts
│   │   │   ├── note.model.ts
│   │   │   └── notification.model.ts
│   │   ├── storage/
│   │   │   └── storage.service.ts  # Source unique de données
│   │   ├── notification.service.ts # Gestion des notifications
│   │   ├── theme.service.ts        # Gestion du thème light/dark
│   │   └── route-animations.ts     # Animations de navigation
│   ├── features/
│   │   ├── onboarding/      # Présentation au premier lancement
│   │   ├── home/            # Page d'accueil
│   │   ├── calendar/        # Calendrier des sorties
│   │   ├── coherence/       # Page SOS (conseils + cohérence cardiaque)
│   │   ├── progress/        # Page de progression
│   │   ├── achivements/     # Page des succès/badges
│   │   └── settings/        # Paramètres et gestion des données
│   └── shared/
│       └── components/
│           ├── menu/                  # Barre de navigation + bouton FAB
│           ├── head/                  # En-tête réutilisable (titre + citation)
│           ├── sortie-modal/          # Modal création/édition/consultation/suppression
│           ├── motivation-banner/     # Citation motivante aléatoire
│           └── badge-notification/    # Notification pop-up badge débloqué
```

---

## 🗄️ StorageService

Toutes les données sont centralisées dans `StorageService`. Les données sont persistées dans le `localStorage`.

### Méthodes disponibles

```typescript
// Sorties
getSorties()              // tableau complet
addSortie(sortie)         // ajoute une sortie
updateSortie(sortie)      // modifie une sortie
deleteSortie(id)          // supprime une sortie

// Objectifs
getObjectifs()                // tableau complet
addObjectif(titre)            // ajoute
updateObjectif(id)            // bascule en cours ↔ terminé
supprimerObjectif(id)         // supprime
getObjectifsEnCours()         // filtre en cours
getObjectifsTermines()        // filtre terminés
getNombreObjectifsEnCours()   // nombre en cours
getNombreObjectifsTermines()  // nombre terminés

// Notes (sujets à aborder en thérapie)
getNotes()                 // tableau complet
addNote(titre, contenu)    // ajoute une note
updateNote(id, titre, contenu) // modifie une note
deleteNote(id)              // supprime une note

// Stats (calculées automatiquement)
getTotalSorties()          // nombre total
getSortiesCeMois()         // sorties du mois en cours
getMoyenneAvant()          // moyenne note avant
getMoyenneApres()          // moyenne note après
getStreak()                // record de jours consécutifs
getRecentesSorties(n)      // n dernières sorties

// Badges
getDerniersBadges(n)           // n derniers badges débloqués
getNombreBadgesDebloques()     // nombre de badges débloqués
getProchainBadge()             // prochain badge à débloquer
nouveauBadge$                  // observable — émet quand un badge est débloqué

// Notifications
getNotif()                 // préférences actuelles
updateNotif(notif)         // met à jour et sauvegarde

// Import / Export
exportData()               // télécharge un fichier .json
importData(fichier)        // importe depuis un fichier .json
clearData()                // efface toutes les données

// Observables (abonnement automatique)
sorties$                   // flux de sorties
objectifs$                 // flux d'objectifs
badges$                    // flux de badges
notes$                     // flux de notes
nouveauBadge$              // flux du dernier badge débloqué
notif$                     // flux des préférences de notifications
```

---

## 🎨 Thèmes

L'application supporte deux thèmes persistants :
- **Light** — fond nuageux rose/mauve, cartes blanches semi-transparentes
- **Dark** — fond sombre, cartes violet foncé semi-transparentes

Le thème est sauvegardé dans le `localStorage` et appliqué automatiquement au rechargement (via `ThemeService`, injecté au démarrage de `AppComponent`).

---

## 🆘 Page SOS

Anciennement une simple carte "Cohérence cardiaque", la page SOS propose désormais deux vues :

- **Vue conseils** (par défaut) — techniques anti-crise d'anxiété (respiration, ancrage 5-4-3-2-1, numéro d'urgence) et une carte d'entrée vers l'exercice
- **Vue exercice** — cohérence cardiaque guidée en plein écran (3 modes : classique, relaxant, tonifiant), accessible via le bouton "Commencer" puis "← Retour" pour revenir aux conseils

Cette séparation évite le défilement pendant l'exercice de respiration tout en gardant les conseils accessibles.

---

## 📝 Notes

Depuis la Home, une section permet de noter les sujets à aborder avec sa psy (titre + contenu). Les notes sont modifiables, supprimables et incluses dans l'export/import des données.

---

## 💾 Gestion des données

Depuis la page **Paramètres** tu peux :
- **Sauvegarder** → télécharge un fichier `mira-backup-xx-xx-xxxx.json`
- **Importer** → recharge toutes tes données depuis un fichier de sauvegarde (les badges sont recalculés automatiquement)
- **Effacer** → supprime toutes les données (avec confirmation)
- **Revoir la présentation** → relance l'onboarding

---

## 🔔 Notifications

Depuis la page **Paramètres** tu peux activer/désactiver et configurer l'heure de :
- **Rappel de sortie** — rappel quotidien d'enregistrer une sortie (défaut : 18h00)
- **Encouragement** — message motivant quotidien (défaut : 09h00)
- **Cohérence cardiaque** — 3 rappels par jour (défaut : 08h00, 13h00, 18h00)

> ⚠️ Les notifications ne fonctionnent que lorsque l'application est ouverte dans le navigateur (limitation PWA sans serveur backend).

---

## 🏆 Système de badges

40 badges répartis en 5 catégories :
- **Nombre de sorties** — de la première sortie à 200 sorties
- **Humeurs** — selon les catégories très bien, bien, moyen, anxieuse
- **Progression** — amélioration entre note avant et note après
- **Répétitions** — jours consécutifs de sorties
- **Objectifs** — objectifs personnels terminés

Une notification pop-up s'affiche automatiquement quand un badge est débloqué.

---

## 👋 Onboarding

Au premier lancement (ou après clic sur "Revoir la présentation" dans les Paramètres), 5 slides présentent les fonctionnalités clés avec des mockups visuels de l'interface : Home, Calendrier (+ bouton d'ajout rapide), Progression, Succès et Paramètres.

---

## 🚀 Lancer le projet

```bash
# Installation des dépendances
npm install

# Serveur de développement
ng serve
```

Puis ouvrir [http://localhost:4200](http://localhost:4200)

---

## 🛠️ Commandes utiles

```bash
# Générer un composant
ng generate component features/nom-du-composant

# Générer un service
ng generate service core/nom-du-service

# Build de production
ng build

# Déploiement GitHub Pages
ng build --base-href /Mira/
```

---

## 🔧 Technologies

- **Angular 21** — Framework principal
- **angular-calendar** — Composant calendrier
- **LocalStorage** — Persistance des données
- **SCSS / SASS** — Styles
- **PWA** — Progressive Web App (manifest + service worker)
- **GitHub Pages** — Hébergement