🌸 Mira
Mira est une application mobile Angular de suivi de sorties pour les personnes souffrant d'anxiété sociale ou d'agoraphobie. Elle permet de planifier, noter et analyser ses sorties du quotidien, avec un système de succès pour encourager la progression.

📱 Pages de l'application
PageDescriptionHomeTableau de bord avec résumé des stats, derniers badges et sorties récentesCalendrierPlanification et consultation des sorties par moisSuccèsCollection de badges à débloquer selon sa progressionProgressionStatistiques détaillées, graphique mensuel et objectifs personnelsParamètresConfiguration de l'application

🏗️ Architecture
src/
├── app/
│   ├── core/
│   │   ├── models/          # Interfaces TypeScript (Sortie, Badge, Objectif)
│   │   └── storage/         # StorageService — source unique de données
│   ├── features/
│   │   ├── home/            # Page d'accueil
│   │   ├── calendar/        # Calendrier des sorties
│   │   ├── achivements/     # Page des succès/badges
│   │   ├── progress/        # Page de progression
│   │   └── settings/        # Paramètres
│   └── shared/
│       └── components/
│           ├── menu/              # Barre de navigation + bouton FAB
│           ├── sortie-modal/      # Modal création/édition/consultation
│           └── motivation-banner/ # Bandeau avec citation motivante

🗄️ StorageService
Toutes les données sont centralisées dans StorageService. Les données sont persistées dans le localStorage.
Méthodes disponibles
typescript// Sorties
getSorties()           // tableau complet
addSortie(sortie)      // ajoute une sortie
updateSortie(sortie)   // modifie une sortie
deleteSortie(id)       // supprime une sortie

// Objectifs
getObjectifs()            // tableau complet
addObjectif(titre)        // ajoute
updateObjectif(id)        // bascule en cours ↔ terminé
supprimerObjectif(id)     // supprime
getObjectifsEnCours()     // filtre en cours
getObjectifsTermines()    // filtre terminés

// Stats (calculées automatiquement)
getTotalSorties()         // nombre total
getSortiesCeMois()        // sorties du mois en cours
getMoyenneAvant()         // moyenne note avant
getMoyenneApres()         // moyenne note après
getStreak()               // record de jours consécutifs
getRecentesSorties(n)     // n dernières sorties

// Badges
getDerniersBadges(n)      // n derniers badges débloqués

// Observables (abonnement automatique)
sorties$                  // flux de sorties
objectifs$                // flux d'objectifs
badges$                   // flux de badges

🚀 Lancer le projet
bash# Installation des dépendances
npm install

# Serveur de développement
ng serve
Puis ouvrir http://localhost:4200

🛠️ Commandes utiles
bash# Générer un composant
ng generate component features/nom-du-composant

# Générer un service
ng generate service core/nom-du-service

# Build de production
ng build

🔧 Technologies

Angular 21 — Framework principal
angular-calendar — Composant calendrier
LocalStorage — Persistance des données
SCSS / SASS — Styles