import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sortie } from '../models/sortie.model';
import { Objectif } from '../models/objectif.model';
import { Badge } from '../models/badge.model';

/*================================*/
/*          STORAGE SERVICE       */
/*  Source unique de vérité de    */
/*  toutes les données de l'app   */
/*================================*/
/*==================================================*/
/*             STORAGE SERVICE                      */
/*  Ce service est la source unique de données      */
/*  de toute l'application.                         */
/*                                                  */
/*  MÉTHODES DISPONIBLES DEPUIS N'IMPORTE OÙ :      */
/*                                                  */
/*  --- SORTIES ---                                 */
/*  getSorties()          → tableau complet         */
/*  addSortie(sortie)     → ajoute une sortie       */
/*  updateSortie(sortie)  → modifie une sortie      */
/*  deleteSortie(id)      → supprime une sortie     */
/*                                                  */
/*  --- OBJECTIFS ---                               */
/*  getObjectifs()           → tableau complet      */
/*  addObjectif(titre)       → ajoute               */
/*  updateObjectif(id)       → bascule le statut    */
/*  supprimerObjectif(id)    → supprime             */
/*  getObjectifsEnCours()    → filtre en cours      */
/*  getObjectifsTermines()   → filtre terminés      */
/*                                                  */
/*  --- STATS ---                                   */
/*  getTotalSorties()        → nombre total         */
/*  getSortiesCeMois()       → sorties ce mois      */
/*  getMoyenneAvant()        → moyenne note avant   */
/*  getMoyenneApres()        → moyenne note après   */
/*  getStreak()              → jours consécutifs    */
/*  getRecentesSorties(n)    → n dernières          */
/*  getNombreObjectifsEnCours()  → nombre en cours  */
/*  getNombreObjectifsTermines() → nombre terminés  */
/*  getNombreBadgesDebloques()   → nombre débloqués */
/*                                                  */
/*  --- BADGES ---                                  */
/*  badges$                  → observable           */
/*  getDerniersBadges(n)     → n derniers           */
/*                                                  */
/*  --- OBSERVABLES (abonnement automatique) ---    */
/*  sorties$    → flux de sorties                   */
/*  objectifs$  → flux d'objectifs                  */
/*  badges$     → flux de badges                    */
/*==================================================*/
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /*================================*/
  /*         BEHAVIOR SUBJECTS      */
  /*================================*/
  private sortiesSubject = new BehaviorSubject<Sortie[]>([]);
  private objectifsSubject = new BehaviorSubject<Objectif[]>([]);
  private badgesSubject = new BehaviorSubject<Badge[]>([]);

  sorties$ = this.sortiesSubject.asObservable();
  objectifs$ = this.objectifsSubject.asObservable();
  badges$ = this.badgesSubject.asObservable();

  /*================================*/
  /*          CONSTRUCTEUR          */
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
      this.badgesSubject.next(this.getDefaultBadges());
    }

    this.verifierBadges(this.sortiesSubject.getValue());
  }

  /*================================*/
  /*       SAUVEGARDE PRIVÉE        */
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
  getSorties(): Sortie[] {
    return this.sortiesSubject.getValue();
  }

  addSortie(sortie: Sortie): void {
    const current = this.sortiesSubject.getValue();
    const updated = [...current, sortie];
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
    this.verifierBadges(updated);
  }

  updateSortie(sortie: Sortie): void {
    const updated = this.sortiesSubject
      .getValue()
      .map((s) => (s.id === sortie.id ? sortie : s));
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  deleteSortie(id: string): void {
    const updated = this.sortiesSubject.getValue().filter((s) => s.id !== id);
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  /*================================*/
  /*            OBJECTIFS           */
  /*================================*/
  getObjectifs(): Objectif[] {
    return this.objectifsSubject.getValue();
  }

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

  supprimerObjectif(id: string): void {
    const updated = this.objectifsSubject
      .getValue()
      .filter((obj) => obj.id !== id);
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Nombre d'objectifs en cours
  getNombreObjectifsEnCours(): number {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'en cours').length;
  }

  // Nombre d'objectifs terminés
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

  // Sorties du mois en cours
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

  // Moyenne des notes avant
  getMoyenneAvant(): number {
    const notes = this.sortiesSubject
      .getValue()
      .map((s) => s.extendedProps?.noteAvant)
      .filter((note): note is number => typeof note === 'number');
    if (!notes.length) return 0;
    return notes.reduce((acc, n) => acc + n, 0) / notes.length;
  }

  // Moyenne des notes après
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

  // N sorties les plus récentes
  getRecentesSorties(nombre: number = 5): Sortie[] {
    return [...this.sortiesSubject.getValue()]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, nombre);
  }

  // Derniers badges débloqués
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

  // Nombre de badges débloqués
  getNombreBadgesDebloques(): number {
    return this.badgesSubject.getValue().filter((b) => b.unlocked).length;
  }

  // Objectifs en cours
  getObjectifsEnCours(): Objectif[] {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'en cours');
  }

  // Objectifs terminés
  getObjectifsTermines(): Objectif[] {
    return this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'terminé');
  }

  /*================================*/
  /*         JOURS CONSÉCUTIFS      */
  /*================================*/
  getMaxJoursConsecutifs(sorties: Sortie[]): number {
    if (sorties.length === 0) return 0;

    const triees = [...sorties].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    let maxConsecutifs = 1;
    let compteur = 1;
    const UN_JOUR_MS = 86400000;

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
  /*================================*/
  private verifierBadges(sorties: Sortie[]): void {
    const total = sorties.length;
    const badges = this.badgesSubject.getValue();

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

    const objectifsTermines = this.objectifsSubject
      .getValue()
      .filter((o) => o.statut === 'terminé').length;

    const maxConsecutifs = this.getMaxJoursConsecutifs(sorties);

    const sortiesAvecAmelioration = sorties.filter(
      (s) =>
        s.extendedProps?.noteApres !== undefined &&
        s.extendedProps?.noteAvant !== undefined &&
        s.extendedProps.noteApres > s.extendedProps.noteAvant,
    ).length;

    const regles: { [id: string]: boolean } = {
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
      premier_pas: objectifsTermines >= 1,
      objectif_atteint: objectifsTermines >= 3,
      efficacite_pure: objectifsTermines >= 5,
      determination: objectifsTermines >= 10,
      maitrise: objectifsTermines >= 20,
      jours_affillee: maxConsecutifs >= 2,
      toujours_present: maxConsecutifs >= 3,
      rythme_trouve: maxConsecutifs >= 7,
      routine_solide: maxConsecutifs >= 14,
      flow_parfait: maxConsecutifs >= 21,
      constance: maxConsecutifs >= 30,
      petit_mieux: sortiesAvecAmelioration >= 1,
      tu_progresses: sortiesAvecAmelioration >= 5,
      bonne_dynamique: sortiesAvecAmelioration >= 10,
      ascension_positive: sortiesAvecAmelioration >= 20,
    };

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

    this.badgesSubject.next(updated);
    this.saveBadges(updated);
  }

  /*================================*/
  /*        BADGES PAR DÉFAUT       */
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
        description: 'Tu as fait 1 sortie notée "Tendu" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_laches_rien',
        image: 'assets/icons/achivements/2-Humeurs/2TuNeLachesRien.webp',
        title: 'Tu ne lâches rien',
        description: 'Tu as fait 5 sorties notées "Tendu" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'courage_quotidien',
        image: 'assets/icons/achivements/2-Humeurs/2courageQuotidien.webp',
        title: 'Courage Quotidien',
        description: 'Tu as fait 10 sorties notées "Tendu" !',
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
        description: '3 sorties consécutives après une période tendue',
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
        image: 'assets/icons/achivements/4-Repetitions/4ToujoursPrésent.webp',
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
        image: 'assets/icons/achivements/5-Objectifs/5Détermination.webp',
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

  /*================================*/
  /*         IMPORT / EXPORT        */
  /*================================*/

  // Télécharge toutes les données en fichier .json
  exportData(): void {}

  // Importe les données depuis un fichier .json
  importData(fichier: File): void {}

  // Efface toutes les données du localStorage
  clearData(): void {}
}
