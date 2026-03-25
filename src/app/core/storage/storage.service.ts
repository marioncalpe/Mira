import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sortie } from '../models/sortie.model';
import { Objectif } from '../models/objectif.model';
import { Badge } from '../models/badge.model';

/*==================================================*/
/*             STORAGE SERVICE                      */
/*  Ce service est la source unique de données      */
/*  de toute l'application.                         */
/*                                                  */
/*  MÉTHODES DISPONIBLES DEPUIS N'IMPORTE OÙ :      */
/*                                                  */
/*  --- SORTIES ---                                 */
/*  getSorties()             → tableau complet      */
/*  addSortie(sortie)        → ajoute une sortie    */
/*  updateSortie(sortie)     → modifie une sortie   */
/*  deleteSortie(id)         → supprime une sortie  */
/*                                                  */
/*  --- OBJECTIFS ---                               */
/*  getObjectifs()               → tableau complet  */
/*  addObjectif(titre)           → ajoute           */
/*  updateObjectif(id)           → bascule statut   */
/*  supprimerObjectif(id)        → supprime         */
/*  getObjectifsEnCours()        → filtre en cours  */
/*  getObjectifsTermines()       → filtre terminés  */
/*  getNombreObjectifsEnCours()  → nombre en cours  */
/*  getNombreObjectifsTermines() → nombre terminés  */
/*                                                  */
/*  --- STATS ---                                   */
/*  getTotalSorties()        → nombre total         */
/*  getSortiesCeMois()       → sorties ce mois      */
/*  getMoyenneAvant()        → moyenne note avant   */
/*  getMoyenneApres()        → moyenne note après   */
/*  getStreak()              → jours consécutifs    */
/*  getRecentesSorties(n)    → n dernières          */
/*                                                  */
/*  --- BADGES ---                                  */
/*  badges$                      → observable       */
/*  getDerniersBadges(n)         → n derniers       */
/*  getNombreBadgesDebloques()   → nombre débloqués */
/*  getProchainBadge()           → prochain à déblo.*/
/*  nouveauBadge$  → émet quand un badge est débloqué  */
/*                                                  */
/*  --- IMPORT / EXPORT ---                         */
/*  exportData()             → télécharge .json     */
/*  importData(fichier)      → importe depuis .json */
/*  clearData()              → efface tout          */
/*                                                  */
/*  --- OBSERVABLES (abonnement automatique) ---    */
/*  sorties$    → flux de sorties                   */
/*  objectifs$  → flux d'objectifs                  */
/*  badges$     → flux de badges                    */
/*==================================================*/

@Injectable({
  providedIn: 'root', // Une seule instance partagée dans toute l'app
})
export class StorageService {
  /*================================*/
  /*         BEHAVIOR SUBJECTS      */
  /*  Les "boîtes" qui stockent     */
  /*  les données en temps réel     */
  /*================================*/

  // Privés : seul ce service peut les modifier directement
  private sortiesSubject = new BehaviorSubject<Sortie[]>([]);
  private objectifsSubject = new BehaviorSubject<Objectif[]>([]);
  private badgesSubject = new BehaviorSubject<Badge[]>([]);
  private nouveauBadgeSubject = new BehaviorSubject<Badge | null>(null);

  // Publics en lecture seule : les composants s'y abonnent
  sorties$ = this.sortiesSubject.asObservable();
  objectifs$ = this.objectifsSubject.asObservable();
  badges$ = this.badgesSubject.asObservable();
  nouveauBadge$ = this.nouveauBadgeSubject.asObservable();

  /*================================*/
  /*          CONSTRUCTEUR          */
  /*  S'exécute au démarrage de     */
  /*  l'app, charge le localStorage */
  /*================================*/
  constructor() {
    const sorties = localStorage.getItem('sorties');
    const objectifs = localStorage.getItem('objectifs');
    const badges = localStorage.getItem('badges');

    if (sorties) this.sortiesSubject.next(JSON.parse(sorties));
    if (objectifs) this.objectifsSubject.next(JSON.parse(objectifs));
    if (badges) {
      this.badgesSubject.next(JSON.parse(badges));
    } else {
      // Premier lancement : on charge les badges par défaut
      this.badgesSubject.next(this.getDefaultBadges());
    }

    // Vérification des badges au démarrage
    this.verifierBadges(this.sortiesSubject.getValue());
  }

  /*================================*/
  /*       SAUVEGARDE PRIVÉE        */
  /*  JSON.stringify() convertit    */
  /*  le tableau en texte pour      */
  /*  le stocker dans localStorage  */
  /*================================*/

  private saveSorties(sorties: Sortie[]): void {
    localStorage.setItem('sorties', JSON.stringify(sorties));
  }

  private saveObjectifs(objectifs: Objectif[]): void {
    localStorage.setItem('objectifs', JSON.stringify(objectifs));
  }

  private saveBadges(badges: Badge[]): void {
    localStorage.setItem('badges', JSON.stringify(badges));
  }

  /*================================*/
  /*            SORTIES             */
  /*================================*/

  // Retourne la liste actuelle sans s'abonner (lecture synchrone)
  getSorties(): Sortie[] {
    return this.sortiesSubject.getValue();
  }

  // Ajoute une nouvelle sortie et vérifie les badges
  addSortie(sortie: Sortie): void {
    const current = this.sortiesSubject.getValue();
    const updated = [...current, sortie];
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
    this.verifierBadges(updated);
  }

  // Remplace une sortie existante par la version modifiée
  updateSortie(sortie: Sortie): void {
    const updated = this.sortiesSubject
      .getValue()
      .map((s) => (s.id === sortie.id ? sortie : s));
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  // Supprime une sortie par son id
  deleteSortie(id: string): void {
    const updated = this.sortiesSubject.getValue().filter((s) => s.id !== id);
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  /*================================*/
  /*            OBJECTIFS           */
  /*================================*/

  // Retourne la liste actuelle sans s'abonner (lecture synchrone)
  getObjectifs(): Objectif[] {
    return this.objectifsSubject.getValue();
  }

  // Crée et ajoute un nouvel objectif
  addObjectif(titre: string): void {
    const newObjectif: Objectif = {
      id: Math.random().toString(36).substr(2, 9),
      titre,
      statut: 'en cours',
      dateCreation: new Date().toISOString(),
    };
    const current = this.objectifsSubject.getValue();
    const updated = [...current, newObjectif];
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Bascule le statut d'un objectif : 'en cours' ↔ 'terminé'
  updateObjectif(id: string): void {
    const updated = this.objectifsSubject.getValue().map((obj) => {
      if (obj.id !== id) return obj;
      return obj.statut === 'en cours'
        ? {
            ...obj,
            statut: 'terminé' as const,
            dateValidation: new Date().toISOString(),
          }
        : { ...obj, statut: 'en cours' as const, dateValidation: undefined };
    });
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Supprime un objectif par son id
  supprimerObjectif(id: string): void {
    const updated = this.objectifsSubject
      .getValue()
      .filter((obj) => obj.id !== id);
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Retourne uniquement les objectifs en cours
  getObjectifsEnCours(): Objectif[] {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'en cours');
  }

  // Retourne uniquement les objectifs terminés
  getObjectifsTermines(): Objectif[] {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'terminé');
  }

  // Retourne le nombre d'objectifs en cours
  getNombreObjectifsEnCours(): number {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'en cours').length;
  }

  // Retourne le nombre d'objectifs terminés
  getNombreObjectifsTermines(): number {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'terminé').length;
  }

  /*================================*/
  /*              STATS             */
  /*  Calculs centralisés           */
  /*  utilisables partout           */
  /*================================*/

  // Nombre total de sorties
  getTotalSorties(): number {
    return this.sortiesSubject.getValue().length;
  }

  // Nombre de sorties du mois en cours
  getSortiesCeMois(): number {
    const now = new Date();
    return this.sortiesSubject.getValue().filter((s) => {
      const date = new Date(s.start);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
  }

  // Moyenne de toutes les notes avant
  getMoyenneAvant(): number {
    const notes = this.sortiesSubject
      .getValue()
      .map((s) => s.extendedProps?.noteAvant)
      .filter((note): note is number => typeof note === 'number');
    if (!notes.length) return 0;
    return notes.reduce((acc, n) => acc + n, 0) / notes.length;
  }

  // Moyenne de toutes les notes après
  getMoyenneApres(): number {
    const notes = this.sortiesSubject
      .getValue()
      .map((s) => s.extendedProps?.noteApres)
      .filter((note): note is number => typeof note === 'number');
    if (!notes.length) return 0;
    return notes.reduce((acc, n) => acc + n, 0) / notes.length;
  }

  // Record de jours consécutifs
  getStreak(): number {
    return this.getMaxJoursConsecutifs(this.sortiesSubject.getValue());
  }

  // Retourne les n sorties les plus récentes (5 par défaut)
  getRecentesSorties(nombre: number = 5): Sortie[] {
    return [...this.sortiesSubject.getValue()]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, nombre);
  }

  /*================================*/
  /*             BADGES             */
  /*================================*/

  // Retourne les n derniers badges débloqués (3 par défaut)
  getDerniersBadges(nombre: number = 3): Badge[] {
    return [...this.badgesSubject.getValue()]
      .filter((b) => b.unlocked)
      .sort(
        (a, b) =>
          new Date(b.dateUnlocked ?? 0).getTime() -
          new Date(a.dateUnlocked ?? 0).getTime(),
      )
      .slice(0, nombre);
  }

  // Retourne le nombre total de badges débloqués
  getNombreBadgesDebloques(): number {
    return this.badgesSubject.getValue().filter((b) => b.unlocked).length;
  }

  // Retourne le premier badge pas encore débloqué
  // Utile pour afficher "prochain badge" sur la Home
  getProchainBadge(): Badge | null {
    return this.badgesSubject.getValue().find((b) => !b.unlocked) ?? null;
  }

  /*================================*/
  /*         JOURS CONSÉCUTIFS      */
  /*  Calcule le record de jours    */
  /*  consécutifs de sorties        */
  /*================================*/
  getMaxJoursConsecutifs(sorties: Sortie[]): number {
    if (sorties.length === 0) return 0;

    // Tri du plus ancien au plus récent
    const triees = [...sorties].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    let maxConsecutifs = 1;
    let compteur = 1;
    const UN_JOUR_MS = 86400000; // 24h en millisecondes

    for (let i = 1; i < triees.length; i++) {
      const dateActuelle = new Date(triees[i].start);
      const datePrecedente = new Date(triees[i - 1].start);
      const diff = dateActuelle.getTime() - datePrecedente.getTime();

      if (diff === UN_JOUR_MS) {
        compteur++;
        maxConsecutifs = Math.max(maxConsecutifs, compteur);
      } else {
        compteur = 1;
      }
    }

    return maxConsecutifs;
  }

  /*================================*/
  /*        LOGIQUE BADGES          */
  /*  Appelée à chaque ajout de     */
  /*  sortie et au démarrage        */
  /*================================*/
  private verifierBadges(sorties: Sortie[]): void {
    const total = sorties.length;
    const badges = this.badgesSubject.getValue();

    // Comptage par catégorie d'humeur
    const tresbien = sorties.filter(
      (s) => s.extendedProps?.category === 'tresbien',
    ).length;
    const bien = sorties.filter(
      (s) => s.extendedProps?.category === 'bien',
    ).length;
    const moyen = sorties.filter(
      (s) => s.extendedProps?.category === 'moyen',
    ).length;
    const anxieuse = sorties.filter(
      (s) => s.extendedProps?.category === 'anxieuse',
    ).length;

    // Nombre d'objectifs terminés
    const objectifsTermines = this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'terminé').length;

    // Record de jours consécutifs
    const maxConsecutifs = this.getMaxJoursConsecutifs(sorties);

    // Sorties où la note après > note avant (amélioration)
    const sortiesAvecAmelioration = sorties.filter(
      (s) =>
        s.extendedProps?.noteApres !== undefined &&
        s.extendedProps?.noteAvant !== undefined &&
        s.extendedProps.noteApres > s.extendedProps.noteAvant,
    ).length;

    /*================================*/
    /*      RÈGLES DE DÉBLOCAGE       */
    /*================================*/
    const regles: { [id: string]: boolean } = {
      // Nombre de sorties
      premiere_sortie: total >= 1,
      en_mouvement: total >= 5,
      mira_active: total >= 10,
      exploratrice: total >= 20,
      aventurier: total >= 30,
      nomade: total >= 50,
      toujours_dehors: total >= 75,
      marathonien: total >= 100,
      inarretable: total >= 150,
      legende_sortie: total >= 200,
      // Humeurs
      rayon_soleil: tresbien >= 5,
      energie_positive: tresbien >= 15,
      humeur_or: tresbien >= 30,
      bonne_vibes: bien >= 5,
      optimiste: bien >= 10,
      stable_sereine: bien >= 25,
      cava_aller: moyen >= 5,
      tu_tiens_cap: moyen >= 15,
      ressilient: moyen >= 30,
      sortie_courageuse: anxieuse >= 1,
      tu_laches_rien: anxieuse >= 5,
      courage_quotidien: anxieuse >= 10,
      // Objectifs
      premier_pas: objectifsTermines >= 1,
      objectif_atteint: objectifsTermines >= 3,
      efficacite_pure: objectifsTermines >= 5,
      determination: objectifsTermines >= 10,
      maitrise: objectifsTermines >= 20,
      // Répétitions (jours consécutifs)
      jours_affillee: maxConsecutifs >= 2,
      toujours_present: maxConsecutifs >= 3,
      rythme_trouve: maxConsecutifs >= 7,
      routine_solide: maxConsecutifs >= 14,
      flow_parfait: maxConsecutifs >= 21,
      constance: maxConsecutifs >= 30,
      // Amélioration
      petit_mieux: sortiesAvecAmelioration >= 1,
      tu_progresses: sortiesAvecAmelioration >= 5,
      bonne_dynamique: sortiesAvecAmelioration >= 10,
      ascension_positive: sortiesAvecAmelioration >= 20,
    };

    // Pour chaque badge non débloqué, on vérifie si la règle est remplie
    const updated = badges.map((badge) => {
      if (badge.unlocked) return badge;
      if (regles[badge.id]) {
        return {
          ...badge,
          unlocked: true,
          dateUnlocked: new Date().toISOString(),
        };
      }
      return badge;
    });

    // On cherche les badges NOUVELLEMENT débloqués (qui ne l'étaient pas avant)
    const badgesNewellementDebloques = updated.filter((newBadge) => {
      const oldBadge = badges.find((b) => b.id === newBadge.id);
      return !oldBadge?.unlocked && newBadge.unlocked;
    });

    // On émet seulement le badge le plus récent s'il vient d'être débloqué
    if (badgesNewellementDebloques.length > 0) {
      const dernierDebloque = badgesNewellementDebloques.sort(
        (a, b) =>
          new Date(b.dateUnlocked ?? 0).getTime() -
          new Date(a.dateUnlocked ?? 0).getTime(),
      )[0];
      this.nouveauBadgeSubject.next(dernierDebloque);
    }

    this.badgesSubject.next(updated);
    this.saveBadges(updated);
  }

  /*================================*/
  /*         IMPORT / EXPORT        */
  /*  Gestion des sauvegardes       */
  /*  depuis la page Paramètres     */
  /*================================*/

  // Télécharge toutes les données dans un fichier .json
  exportData(): void {
    // 1. On récupère toutes les données
    const data = {
      sorties: this.sortiesSubject.getValue(),
      objectifs: this.objectifsSubject.getValue(),
      //badges: this.badgesSubject.getValue(),
    };

    // 2. On convertit en texte JSON lisible (le 2 = indentation pour que ce soit joli)
    const json = JSON.stringify(data, null, 2);

    // 3. On crée un fichier téléchargeable en mémoire
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // 4. On crée un lien invisible et on clique dessus automatiquement
    const a = document.createElement('a');
    a.href = url;
    a.download = `mira-backup-${new Date().toLocaleDateString('fr-FR')}.json`;
    a.click();

    // 5. On libère la mémoire
    URL.revokeObjectURL(url);
  }

  // Importe les données depuis un fichier .json
  importData(fichier: File): void {
    // 1. FileReader lit le contenu du fichier
    const reader = new FileReader();

    // 2. Cette fonction s'exécute quand la lecture est terminée (asynchrone)
    reader.onload = (event) => {
      try {
        // 3. On parse le JSON
        const data = JSON.parse(event.target?.result as string);

        // 4. On remet les données dans les BehaviorSubjects
        // ?? [] = si la donnée est absente, on met un tableau vide par défaut
        this.sortiesSubject.next(data.sorties ?? []);
        this.objectifsSubject.next(data.objectifs ?? []);
        // this.badgesSubject.next(data.badges ?? this.getDefaultBadges());

        // 5. On sauvegarde dans le localStorage
        this.saveSorties(data.sorties ?? []);
        this.saveObjectifs(data.objectifs ?? []);
        // this.saveBadges(data.badges ?? this.getDefaultBadges());

        this.verifierBadges(data.sorties ?? []);
      } catch (e) {
        // Si le fichier est invalide ou corrompu
        alert('Fichier invalide !');
      }
    };

    // 6. On lance la lecture du fichier
    reader.readAsText(fichier);
  }

  // Efface toutes les données (avec confirmation)
  clearData(): void {
    if (confirm('Es-tu sûr de vouloir effacer toutes tes données ?')) {
      localStorage.clear();
      this.sortiesSubject.next([]);
      this.objectifsSubject.next([]);
      // On recharge les badges par défaut (tous verrouillés)
      this.badgesSubject.next(this.getDefaultBadges());
    }
  }

  /*================================*/
  /*        BADGES PAR DÉFAUT       */
  /*  Chargés au premier lancement  */
  /*  ou après un effacement        */
  /*================================*/
  private getDefaultBadges(): Badge[] {
    return [
      {
        id: 'premiere_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1PremiereSortie.webp',
        title: 'Première Sortie',
        description: 'Tu viens de commencer ton aventure !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'en_mouvement',
        image: 'assets/icons/achivements/1-NombresDeSorties/1EnMouvement.webp',
        title: 'En mouvement',
        description: 'Tu as fait 5 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'mira_active',
        image: 'assets/icons/achivements/1-NombresDeSorties/1MiraActive.webp',
        title: 'Mira Active',
        description: 'Tu as fait 10 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'exploratrice',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Exploratrice.webp',
        title: 'Exploratrice',
        description: 'Tu as fait 20 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'aventurier',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Aventurier.webp',
        title: 'Aventurier',
        description: 'Tu as fait 30 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'nomade',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Nomade.webp',
        title: 'Nomade',
        description: 'Tu as fait 50 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_dehors',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1ToujoursDehors.webp',
        title: 'Toujours dehors',
        description: 'Tu as fait 75 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'marathonien',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Maratonien.webp',
        title: 'Maratonien',
        description: 'Tu as fait 100 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'inarretable',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Inarretable.webp',
        title: 'Inarrêtable',
        description: 'Tu as fait 150 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'legende_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1LegendesSortie.webp',
        title: 'Légende de la Sortie',
        description: 'Tu as fait 200 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'rayon_soleil',
        image: 'assets/icons/achivements/2-Humeurs/2RayonDeSoleil.webp',
        title: 'Rayon de Soleil',
        description: 'Tu as fait 5 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'energie_positive',
        image: 'assets/icons/achivements/2-Humeurs/2EnergiePositive.webp',
        title: 'Energie Positive',
        description: 'Tu as fait 15 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'humeur_or',
        image: 'assets/icons/achivements/2-Humeurs/2HumeurEnOr.webp',
        title: 'Humeur en Or',
        description: 'Tu as fait 30 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_vibes',
        image: 'assets/icons/achivements/2-Humeurs/2BonneVibes.webp',
        title: 'Bonne Vibes',
        description: 'Tu as fait 5 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'optimiste',
        image: 'assets/icons/achivements/2-Humeurs/2Optimiste.webp',
        title: 'Optimiste',
        description: 'Tu as fait 10 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'stable_sereine',
        image: 'assets/icons/achivements/2-Humeurs/2StableEtSereine.webp',
        title: 'Stable et Sereine',
        description: 'Tu as fait 25 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'cava_aller',
        image: 'assets/icons/achivements/2-Humeurs/2CavaAller.webp',
        title: 'Ca va Aller',
        description: 'Tu as fait 5 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_tiens_cap',
        image: 'assets/icons/achivements/2-Humeurs/2TuTiensLeCap.webp',
        title: 'Tu tiens le Cap',
        description: 'Tu as fait 15 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ressilient',
        image: 'assets/icons/achivements/2-Humeurs/2Ressilient.webp',
        title: 'Ressilient',
        description: 'Tu as fait 30 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'sortie_courageuse',
        image: 'assets/icons/achivements/2-Humeurs/2SortieCourageuse.webp',
        title: 'Sortie Courageuse',
        description: 'Tu as fait 1 sortie notée "Anxieux" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_laches_rien',
        image: 'assets/icons/achivements/2-Humeurs/2TuNeLachesRien.webp',
        title: 'Tu ne lâches rien',
        description: 'Tu as fait 5 sorties notées "Anxieux" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'courage_quotidien',
        image: 'assets/icons/achivements/2-Humeurs/2courageQuotidien.webp',
        title: 'Courage Quotidien',
        description: 'Tu as fait 10 sorties notées "Anxieux" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'petit_mieux',
        image: 'assets/icons/achivements/3-Progression/3PetitMieux.webp',
        title: 'Petit Mieux',
        description: 'Une sortie avec une humeur meilleure que la précédente',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_progresses',
        image: 'assets/icons/achivements/3-Progression/3Tuprograsse.webp',
        title: 'Tu progresses',
        description: "Tu as fait 5 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_dynamique',
        image: 'assets/icons/achivements/3-Progression/3BonneDynamique.webp',
        title: 'Bonne Dynamique',
        description: "Tu as fait 10 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ascension_positive',
        image: 'assets/icons/achivements/3-Progression/3AscensionPositive.webp',
        title: 'Ascension Positive',
        description: "Tu as fait 20 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'revenir_plus_fort',
        image: 'assets/icons/achivements/3-Progression/3RevenirplusFort.webp',
        title: 'Revenir plus Fort',
        description: 'Tu as fait 1 sortie améliorée après un jour difficile !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'resilience',
        image: 'assets/icons/achivements/3-Progression/3Resilience.webp',
        title: 'Résilience',
        description: '3 sorties consécutives après une période Anxieux',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'transformation',
        image: 'assets/icons/achivements/3-Progression/3Transformation.webp',
        title: 'Transformation',
        description: 'Amélioration visible sur un mois',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'jours_affillee',
        image: 'assets/icons/achivements/4-Repetitions/4JoursDaffilee.webp',
        title: "2 Jours d'affilée",
        description: 'Tu as fait 2 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_present',
        image: 'assets/icons/achivements/4-Repetitions/4ToujoursPresent.webp',
        title: 'Toujours présent',
        description: 'Tu as fait 3 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'rythme_trouve',
        image: 'assets/icons/achivements/4-Repetitions/4RythmeTrouve.webp',
        title: 'Rythme Trouvé',
        description: 'Tu as fait 7 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'routine_solide',
        image: 'assets/icons/achivements/4-Repetitions/4RoutineSolide.webp',
        title: 'Routine Solide',
        description: 'Tu as fait 14 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'flow_parfait',
        image: 'assets/icons/achivements/4-Repetitions/4FlowParfait.webp',
        title: 'Flow Parfait',
        description: 'Tu as fait 21 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'constance',
        image: 'assets/icons/achivements/4-Repetitions/4Constance.webp',
        title: 'Constance',
        description: 'Tu as fait 30 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'premier_pas',
        image: 'assets/icons/achivements/5-Objectifs/5Premierpas.webp',
        title: 'Premier pas',
        description: 'Tu as fait ton premier objectif !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'objectif_atteint',
        image: 'assets/icons/achivements/5-Objectifs/5ObjectifAtteint.webp',
        title: 'Objectif Atteint',
        description: 'Tu as terminé 3 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'efficacite_pure',
        image: 'assets/icons/achivements/5-Objectifs/5EfficacitéPure.webp',
        title: 'Efficacité Pure',
        description: 'Tu as terminé 5 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'determination',
        image: 'assets/icons/achivements/5-Objectifs/5Determination.webp',
        title: 'Détermination',
        description: 'Tu as terminé 10 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'maitrise',
        image: 'assets/icons/achivements/5-Objectifs/5Maitrise.webp',
        title: 'Maîtrise',
        description: 'Tu as terminé 20 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
    ];
  }
}
