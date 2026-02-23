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

  // Publics en lecture seule : les composants s'y abonnent
  sorties$ = this.sortiesSubject.asObservable();
  objectifs$ = this.objectifsSubject.asObservable();
  badges$ = this.badgesSubject.asObservable();

  /*================================*/
  /*          CONSTRUCTEUR          */
  /*  S'exécute au démarrage de     */
  /*  l'app, charge le localStorage */
  /*================================*/
  constructor() {
    // localStorage ne stocke que du texte (string)
    // getItem() retourne null si rien n'est sauvegardé
    const sorties = localStorage.getItem('sorties');
    const objectifs = localStorage.getItem('objectifs');
    const badges = localStorage.getItem('badges');

    // JSON.parse() reconvertit le texte en tableau TypeScript
    // next() met à jour la boîte et notifie tous les composants abonnés
    if (sorties) this.sortiesSubject.next(JSON.parse(sorties));
    if (objectifs) this.objectifsSubject.next(JSON.parse(objectifs));

    if (badges) {
      this.badgesSubject.next(JSON.parse(badges));
    } else {
      // Premier lancement : on charge les badges par défaut
      this.badgesSubject.next(this.getDefaultBadges());
    }

    // Vérification des badges au démarrage
    // (pour débloquer les badges déjà mérités)
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
    this.verifierBadges(updated); // On vérifie les badges à chaque ajout
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
      id: Math.random().toString(36).substr(2, 9), // ID aléatoire
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
        ? { ...obj, statut: 'terminé' as const, dateValidation: new Date().toISOString() }
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

  /*================================*/
  /*             BADGES             */
  /*================================*/

  // Retourne le record de jours consécutifs (utilisé dans la page Progression)
  getMaxJoursConsecutifs(sorties: Sortie[]): number {
    if (sorties.length === 0) return 0;

    // Tri du plus ancien au plus récent
    const triees = sorties.sort(
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
    const tresbien  = sorties.filter(s => s.extendedProps?.category === 'tresbien').length;
    const bien      = sorties.filter(s => s.extendedProps?.category === 'bien').length;
    const moyen     = sorties.filter(s => s.extendedProps?.category === 'moyen').length;
    const anxieuse  = sorties.filter(s => s.extendedProps?.category === 'anxieuse').length;

    // Nombre d'objectifs terminés
    const objectifsTermines = this.objectifsSubject
      .getValue()
      .filter(o => o.statut === 'terminé').length;

    // Record de jours consécutifs
    const maxConsecutifs = this.getMaxJoursConsecutifs(sorties);

    // Sorties où l'anxiété a diminué (noteApres < noteAvant = amélioration)
    const sortiesAvecAmelioration = sorties.filter(s =>
      s.extendedProps?.noteApres !== undefined &&
      s.extendedProps?.noteAvant !== undefined &&
      s.extendedProps.noteApres > s.extendedProps.noteAvant,
    ).length;

    /*================================*/
    /*      RÈGLES DE DÉBLOCAGE       */
    /*================================*/
    const regles: { [id: string]: boolean } = {
      // Nombre de sorties
      premiere_sortie:  total >= 1,
      en_mouvement:     total >= 5,
      mira_active:      total >= 10,
      exploratrice:     total >= 20,
      aventurier:       total >= 30,
      nomade:           total >= 50,
      toujours_dehors:  total >= 75,
      marathonien:      total >= 100,
      inarretable:      total >= 150,
      legende_sortie:   total >= 200,

      // Humeurs
      rayon_soleil:     tresbien >= 5,
      energie_positive: tresbien >= 15,
      humeur_or:        tresbien >= 30,
      bonne_vibes:      bien >= 5,
      optimiste:        bien >= 10,
      stable_sereine:   bien >= 25,
      cava_aller:       moyen >= 5,
      tu_tiens_cap:     moyen >= 15,
      ressilient:       moyen >= 30,
      sortie_courageuse: anxieuse >= 1,
      tu_laches_rien:   anxieuse >= 5,
      courage_quotidien: anxieuse >= 10,

      // Objectifs
      premier_pas:      objectifsTermines >= 1,
      objectif_atteint: objectifsTermines >= 3,
      efficacite_pure:  objectifsTermines >= 5,
      determination:    objectifsTermines >= 10,
      maitrise:         objectifsTermines >= 20,

      // Répétitions (jours consécutifs)
      jours_affillee:   maxConsecutifs >= 2,
      toujours_present: maxConsecutifs >= 3,
      rythme_trouve:    maxConsecutifs >= 7,
      routine_solide:   maxConsecutifs >= 14,
      flow_parfait:     maxConsecutifs >= 21,
      constance:        maxConsecutifs >= 30,

      // Amélioration d'anxiété
      petit_mieux:        sortiesAvecAmelioration >= 1,
      tu_progresses:      sortiesAvecAmelioration >= 5,
      bonne_dynamique:    sortiesAvecAmelioration >= 10,
      ascension_positive: sortiesAvecAmelioration >= 20,
    };

    // Pour chaque badge non débloqué, on vérifie si la règle est remplie
    const updated = badges.map(badge => {
      if (badge.unlocked) return badge;
      if (regles[badge.id]) {
        return { ...badge, unlocked: true, dateUnlocked: new Date().toISOString() };
      }
      return badge;
    });

    this.badgesSubject.next(updated);
    this.saveBadges(updated);
  }

  /*================================*/
  /*        BADGES PAR DÉFAUT       */
  /*  Chargés au premier lancement  */
  /*================================*/
  private getDefaultBadges(): Badge[] {
    return [
      // Catégorie : Nombre de sorties
      { id: 'premiere_sortie',  image: 'assets/icons/achivements/1-NombresDeSorties/1PremiereSortie.png', title: 'Première Sortie',      description: 'Tu viens de commencer ton aventure !',  unlocked: false, dateUnlocked: null },
      { id: 'en_mouvement',     image: 'assets/icons/achivements/1-NombresDeSorties/1EnMouvement.png',    title: 'En mouvement',           description: 'Tu as fait 5 sorties !',                unlocked: false, dateUnlocked: null },
      { id: 'mira_active',      image: 'assets/icons/achivements/1-NombresDeSorties/1MiraActive.png',     title: 'Mira Active',            description: 'Tu as fait 10 sorties !',               unlocked: false, dateUnlocked: null },
      { id: 'exploratrice',     image: 'assets/icons/achivements/1-NombresDeSorties/1Exploratrice.png',   title: 'Exploratrice',           description: 'Tu as fait 20 sorties !',               unlocked: false, dateUnlocked: null },
      { id: 'aventurier',       image: 'assets/icons/achivements/1-NombresDeSorties/1Aventurier.png',     title: 'Aventurier',             description: 'Tu as fait 30 sorties !',               unlocked: false, dateUnlocked: null },
      { id: 'nomade',           image: 'assets/icons/achivements/1-NombresDeSorties/1Nomade.png',         title: 'Nomade',                 description: 'Tu as fait 50 sorties !',               unlocked: false, dateUnlocked: null },
      { id: 'toujours_dehors',  image: 'assets/icons/achivements/1-NombresDeSorties/1ToujoursDehors.png', title: 'Toujours dehors',        description: 'Tu as fait 75 sorties !',               unlocked: false, dateUnlocked: null },
      { id: 'marathonien',      image: 'assets/icons/achivements/1-NombresDeSorties/1Maratonien.png',     title: 'Maratonien',             description: 'Tu as fait 100 sorties !',              unlocked: false, dateUnlocked: null },
      { id: 'inarretable',      image: 'assets/icons/achivements/1-NombresDeSorties/1Inarretable.png',    title: 'Inarrêtable',            description: 'Tu as fait 150 sorties !',              unlocked: false, dateUnlocked: null },
      { id: 'legende_sortie',   image: 'assets/icons/achivements/1-NombresDeSorties/1LegendesSortie.png', title: 'Légende de la Sortie',   description: 'Tu as fait 200 sorties !',              unlocked: false, dateUnlocked: null },

      // Catégorie : Humeurs
      { id: 'rayon_soleil',     image: 'assets/icons/achivements/2-Humeurs/2RayonDeSoleil.png',   title: 'Rayon de Soleil',    description: 'Tu as fait 5 sorties notées "Tres bien" !',  unlocked: false, dateUnlocked: null },
      { id: 'energie_positive', image: 'assets/icons/achivements/2-Humeurs/2EnergiePositive.png', title: 'Energie Positive',   description: 'Tu as fait 15 sorties notées "Tres bien" !', unlocked: false, dateUnlocked: null },
      { id: 'humeur_or',        image: 'assets/icons/achivements/2-Humeurs/2HumeurEnOr.png',      title: 'Humeur en Or',       description: 'Tu as fait 30 sorties notées "Tres bien" !', unlocked: false, dateUnlocked: null },
      { id: 'bonne_vibes',      image: 'assets/icons/achivements/2-Humeurs/2BonneVibes.png',      title: 'Bonne Vibes',        description: 'Tu as fait 5 sorties notées "Bien" !',       unlocked: false, dateUnlocked: null },
      { id: 'optimiste',        image: 'assets/icons/achivements/2-Humeurs/2Optimiste.png',       title: 'Optimiste',          description: 'Tu as fait 10 sorties notées "Bien" !',      unlocked: false, dateUnlocked: null },
      { id: 'stable_sereine',   image: 'assets/icons/achivements/2-Humeurs/2StableEtSereine.png', title: 'Stable et Sereine',  description: 'Tu as fait 25 sorties notées "Bien" !',      unlocked: false, dateUnlocked: null },
      { id: 'cava_aller',       image: 'assets/icons/achivements/2-Humeurs/2CavaAller.png',       title: 'Ca va Aller',        description: 'Tu as fait 5 sorties notées "Moyen" !',      unlocked: false, dateUnlocked: null },
      { id: 'tu_tiens_cap',     image: 'assets/icons/achivements/2-Humeurs/2TuTiensLeCap.png',    title: 'Tu tiens le Cap',    description: 'Tu as fait 15 sorties notées "Moyen" !',     unlocked: false, dateUnlocked: null },
      { id: 'ressilient',       image: 'assets/icons/achivements/2-Humeurs/2Ressilient.png',      title: 'Ressilient',         description: 'Tu as fait 30 sorties notées "Moyen" !',     unlocked: false, dateUnlocked: null },
      { id: 'sortie_courageuse',image: 'assets/icons/achivements/2-Humeurs/2SortieCourageuse.png',title: 'Sortie Courageuse',  description: 'Tu as fait 1 sortie notée "Tendu" !',        unlocked: false, dateUnlocked: null },
      { id: 'tu_laches_rien',   image: 'assets/icons/achivements/2-Humeurs/2TuNeLachesRien.png',  title: 'Tu ne lâches rien',  description: 'Tu as fait 5 sorties notées "Tendu" !',      unlocked: false, dateUnlocked: null },
      { id: 'courage_quotidien',image: 'assets/icons/achivements/2-Humeurs/2courageQuotidien.png',title: 'Courage Quotidien',  description: 'Tu as fait 10 sorties notées "Tendu" !',     unlocked: false, dateUnlocked: null },

      // Catégorie : Progression
      { id: 'petit_mieux',        image: 'assets/icons/achivements/3-Progression/3PetitMieux.png',        title: 'Petit Mieux',       description: 'Une sortie avec une humeur meilleure que la précédente', unlocked: false, dateUnlocked: null },
      { id: 'tu_progresses',      image: 'assets/icons/achivements/3-Progression/3Tuprograsse.png',       title: 'Tu progresses',     description: "Tu as fait 5 sorties avec une amélioration d'humeur !",  unlocked: false, dateUnlocked: null },
      { id: 'bonne_dynamique',    image: 'assets/icons/achivements/3-Progression/3BonneDynamique.png',    title: 'Bonne Dynamique',   description: "Tu as fait 10 sorties avec une amélioration d'humeur !", unlocked: false, dateUnlocked: null },
      { id: 'ascension_positive', image: 'assets/icons/achivements/3-Progression/3AscensionPositive.png', title: 'Ascension Positive',description: "Tu as fait 20 sorties avec une amélioration d'humeur !", unlocked: false, dateUnlocked: null },
      { id: 'revenir_plus_fort',  image: 'assets/icons/achivements/3-Progression/3RevenirplusFort.png',   title: 'Revenir plus Fort', description: 'Tu as fait 1 sortie améliorée après un jour difficile !',unlocked: false, dateUnlocked: null },
      { id: 'resilience',         image: 'assets/icons/achivements/3-Progression/3Resilience.png',        title: 'Résilience',        description: '3 sorties consécutives après une période tendue',        unlocked: false, dateUnlocked: null },
      { id: 'transformation',     image: 'assets/icons/achivements/3-Progression/3Transformation.png',    title: 'Transformation',    description: 'Amélioration visible sur un mois',                       unlocked: false, dateUnlocked: null },

      // Catégorie : Répétitions
      { id: 'jours_affillee',   image: 'assets/icons/achivements/4-Repetitions/4JoursDaffilee.png',   title: "2 Jours d'affilée", description: 'Tu as fait 2 sorties consécutives !',  unlocked: false, dateUnlocked: null },
      { id: 'toujours_present', image: 'assets/icons/achivements/4-Repetitions/4ToujoursPresent.png', title: 'Toujours présent',  description: 'Tu as fait 3 sorties consécutives !',  unlocked: false, dateUnlocked: null },
      { id: 'rythme_trouve',    image: 'assets/icons/achivements/4-Repetitions/4RythmeTrouve.png',    title: 'Rythme Trouvé',     description: 'Tu as fait 7 sorties consécutives !',  unlocked: false, dateUnlocked: null },
      { id: 'routine_solide',   image: 'assets/icons/achivements/4-Repetitions/4RoutineSolide.png',   title: 'Routine Solide',    description: 'Tu as fait 14 sorties consécutives !', unlocked: false, dateUnlocked: null },
      { id: 'flow_parfait',     image: 'assets/icons/achivements/4-Repetitions/4FlowParfait.png',     title: 'Flow Parfait',      description: 'Tu as fait 21 sorties consécutives !', unlocked: false, dateUnlocked: null },
      { id: 'constance',        image: 'assets/icons/achivements/4-Repetitions/4Constance.png',       title: 'Constance',         description: 'Tu as fait 30 sorties consécutives !', unlocked: false, dateUnlocked: null },

      // Catégorie : Objectifs
      { id: 'premier_pas',      image: 'assets/icons/achivements/5-Objectifs/5Premierpas.png',       title: 'Premier pas',     description: 'Tu as fait ton premier objectif !', unlocked: false, dateUnlocked: null },
      { id: 'objectif_atteint', image: 'assets/icons/achivements/5-Objectifs/5ObjectifAtteint.png',  title: 'Objectif Atteint',description: 'Tu as terminé 3 objectifs !',        unlocked: false, dateUnlocked: null },
      { id: 'efficacite_pure',  image: 'assets/icons/achivements/5-Objectifs/5EfficacitéPure.png',   title: 'Efficacité Pure', description: 'Tu as terminé 5 objectifs !',        unlocked: false, dateUnlocked: null },
      { id: 'determination',    image: 'assets/icons/achivements/5-Objectifs/5Determination.png',    title: 'Détermination',   description: 'Tu as terminé 10 objectifs !',       unlocked: false, dateUnlocked: null },
      { id: 'maitrise',         image: 'assets/icons/achivements/5-Objectifs/5Maitrise.png',         title: 'Maîtrise',        description: 'Tu as terminé 20 objectifs !',       unlocked: false, dateUnlocked: null },
    ];
  }
}