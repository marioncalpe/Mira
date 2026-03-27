# 🌸 Mira

Mira est une application mobile Angular de suivi de sorties pour les personnes souffrant d'anxiété sociale ou d'agoraphobie. Elle permet de planifier, noter et analyser ses sorties du quotidien, avec un système de succès pour encourager la progression.

---

## 📱 Pages de l'application

| Page | Description |
|------|-------------|
| **Home** | Tableau de bord avec résumé des stats, derniers badges et sorties récentes |
| **Calendrier** | Planification et consultation des sorties par mois |
| **Succès** | Collection de badges à débloquer selon sa progression |
| **Progression** | Statistiques détaillées, graphique mensuel et objectifs personnels |
| **Paramètres** | Sauvegarde, import,suppression des données, notification sortie, encouragement et cohérence cardique |

---

## 🏗️ Architecture

```
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
│   │   └── coherence/       # Page cohérence cardiaque
│   │   └── settings/        # Paramètres et gestion des données
│   └── shared/
│       └── components/
│           ├── menu/              # Barre de navigation + bouton FAB
│           ├── sortie-modal/      # Modal création/édition/consultation/suppression
│           └── motivation-banner/ # Bandeau avec citation motivante
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

// Import / Export (depuis la page Paramètres)
exportData()               // télécharge un fichier .json
importData(fichier)        // importe depuis un fichier .json
clearData()                // efface toutes les données

// Observables (abonnement automatique)
sorties$                   // flux de sorties
objectifs$                 // flux d'objectifs
badges$                    // flux de badges
```

---

## 💾 Gestion des données

Depuis la page **Paramètres** tu peux :
- **Sauvegarder** → télécharge un fichier `mira-backup-xx-xx-xxxx.json`
- **Importer** → recharge toutes tes données depuis un fichier de sauvegarde
- **Effacer** → supprime toutes les données (avec confirmation)
- **Notification** → Activer/Désactiver toutes les notification de sortie, encouragement et cohérence cardiaque
- **Sauvegarder notifiation** → Enregistrer les modification de notification
⚠️ **Important** les notification ne peuvent fonctionner que si l'application est ouverte du au fonctionnement PWA
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
```

---

## 🔧 Technologies

- **Angular 21** — Framework principal
- **angular-calendar** — Composant calendrier
- **LocalStorage** — Persistance des données
- **SCSS / SASS** — Styles