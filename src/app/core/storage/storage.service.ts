import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sortie } from '../models/sortie.model';
import { Objectif } from '../models/objectif.model';
import { Badge } from '../models/badge.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private sortiesSubject = new BehaviorSubject<Sortie[]>([]);
  private objectifsSubject = new BehaviorSubject<Objectif[]>([]);
  private badgesSubject = new BehaviorSubject<Badge[]>([]);

  sorties$ = this.sortiesSubject.asObservable();
  objectifs$ = this.objectifsSubject.asObservable();
  badges$ = this.badgesSubject.asObservable();

  constructor() {
    // On récupère les données sauvegardées dans localStorage
    // localStorage ne stocke que du texte, donc les données sont sous forme de string
    // Si rien n'a été sauvegardé, getItem() retourne null
    const sorties = localStorage.getItem('sorties');
    const objectifs = localStorage.getItem('objectifs');
    const badges = localStorage.getItem('badges');

    // Si des sorties existent dans localStorage...
    if (sorties) {
      // JSON.parse() convertit le texte en vrai tableau TypeScript
      // next() met à jour la boîte et notifie tous les composants qui écoutent
      this.sortiesSubject.next(JSON.parse(sorties));
    }

    // Même chose pour les objectifs
    if (objectifs) {
      this.objectifsSubject.next(JSON.parse(objectifs));
    }

    if (badges) {
      this.badgesSubject.next(JSON.parse(badges));
    } else {
      // Si aucun badge en localStorage, on charge les badges par défaut
      this.badgesSubject.next(this.getDefaultBadges());
    }

    // 👇 On vérifie les badges au démarrage aussi !
    this.verifierBadges(this.sortiesSubject.getValue());
  }

  // Sauvegarde les sorties dans localStorage
  private saveSorties(sorties: Sortie[]): void {
    // JSON.stringify() convertit le tableau en texte pour localStorage
    localStorage.setItem('sorties', JSON.stringify(sorties));
  }

  // Sauvegarde les objectifs dans localStorage
  private saveObjectifs(objectifs: Objectif[]): void {
    localStorage.setItem('objectifs', JSON.stringify(objectifs));
  }

  private saveBadges(badges: Badge[]): void {
    localStorage.setItem('badges', JSON.stringify(badges));
  }

  // Retourne la liste actuelle des sorties (sans s'abonner)
  getSorties(): Sortie[] {
    return this.sortiesSubject.getValue();
  }

  // Ajoute une nouvelle sortie
  addSortie(sortie: Sortie): void {
    // On récupère la liste actuelle
    const current = this.sortiesSubject.getValue();
    // On crée un nouveau tableau avec la nouvelle sortie ajoutée
    const updated = [...current, sortie];
    // On met à jour la boîte ET on sauvegarde
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
    // 👇 On vérifie les badges à chaque nouvelle sortie
    this.verifierBadges(updated);
  }

  // Met à jour une sortie existante
  updateSortie(sortie: Sortie): void {
    const updated = this.sortiesSubject
      .getValue()
      .map((s) => (s.id === sortie.id ? sortie : s));
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  // Supprime une sortie
  deleteSortie(id: string): void {
    const updated = this.sortiesSubject.getValue().filter((s) => s.id !== id);
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  // Retourne la liste actuelle des objectifs (sans s'abonner)
  getObjectifs(): Objectif[] {
    return this.objectifsSubject.getValue();
  }

  // Ajoute un nouvel objectif
  addObjectif(titre: string): void {
    const newObjectif: Objectif = {
      // Génère un ID unique aléatoire
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

  // Bascule le statut d'un objectif entre 'en cours' et 'terminé'
  updateObjectif(id: string): void {
    const updated = this.objectifsSubject.getValue().map((obj) => {
      if (obj.id !== id) return obj;
      // Si en cours → terminé, si terminé → en cours
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

  // Supprime un objectif
  supprimerObjectif(id: string): void {
    const updated = this.objectifsSubject
      .getValue()
      .filter((obj) => obj.id !== id);
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Retourne la liste des badges par défaut (premier lancement)
  private getDefaultBadges(): Badge[] {
    return [
      {
        id: 'premiere_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1PremiereSortie.png',
        title: 'Première Sortie',
        description: 'Tu viens de commencer ton aventure !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'en_mouvement',
        image: 'assets/icons/achivements/1-NombresDeSorties/1EnMouvement.png',
        title: 'En mouvement',
        description: 'Tu as fait 5 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'mira_active',
        image: 'assets/icons/achivements/1-NombresDeSorties/1MiraActive.png',
        title: 'Mira Active',
        description: 'Tu as fait 10 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'exploratrice',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Exploratrice.png',
        title: 'Exploratrice',
        description: 'Tu as fait 20 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'aventurier',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Aventurier.png',
        title: 'Aventurier',
        description: 'Tu as fait 30 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'nomade',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Nomade.png',
        title: 'Nomade',
        description: 'Tu as fait 50 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_dehors',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1ToujoursDehors.png',
        title: 'Toujours dehors',
        description: 'Tu as fait 75 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'marathonien',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Maratonien.png',
        title: 'Maratonien',
        description: 'Tu as fait 100 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'inarretable',
        image: 'assets/icons/achivements/1-NombresDeSorties/1Inarretable.png',
        title: 'Inarrêtable',
        description: 'Tu as fait 150 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'legende_sortie',
        image:
          'assets/icons/achivements/1-NombresDeSorties/1LegendesSortie.png',
        title: 'Légende de la Sortie',
        description: 'Tu as fait 200 sorties !',
        unlocked: false,
        dateUnlocked: null,
      },
      // Catégorie Humeurs
      {
        id: 'rayon_soleil',
        image: 'assets/icons/achivements/2-Humeurs/2RayonDeSoleil.png',
        title: 'Rayon de Soleil',
        description: 'Tu as fait 5 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'energie_positive',
        image: 'assets/icons/achivements/2-Humeurs/2EnergiePositive.png',
        title: 'Energie Positive',
        description: 'Tu as fait 15 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'humeur_or',
        image: 'assets/icons/achivements/2-Humeurs/2HumeurEnOr.png',
        title: 'Humeur en Or',
        description: 'Tu as fait 30 sorties notées "Tres bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_vibes',
        image: 'assets/icons/achivements/2-Humeurs/2BonneVibes.png',
        title: 'Bonne Vibes',
        description: 'Tu as fait 5 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'optimiste',
        image: 'assets/icons/achivements/2-Humeurs/2Optimiste.png',
        title: 'Optimiste',
        description: 'Tu as fait 10 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'stable_sereine',
        image: 'assets/icons/achivements/2-Humeurs/2StableEtSereine.png',
        title: 'Stable et Sereine',
        description: 'Tu as fait 25 sorties notées "Bien" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'cava_aller',
        image: 'assets/icons/achivements/2-Humeurs/2CavaAller.png',
        title: 'Ca va Aller',
        description: 'Tu as fait 5 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_tiens_cap',
        image: 'assets/icons/achivements/2-Humeurs/2TuTiensLeCap.png',
        title: 'Tu tiens le Cap',
        description: 'Tu as fait 15 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ressilient',
        image: 'assets/icons/achivements/2-Humeurs/2Ressilient.png',
        title: 'Ressilient',
        description: 'Tu as fait 30 sorties notées "Moyen" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'sortie_courageuse',
        image: 'assets/icons/achivements/2-Humeurs/2SortieCourageuse.png',
        title: 'Sortie Courageuse',
        description: 'Tu as fait 1 sortie notée "Tendu" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_laches_rien',
        image: 'assets/icons/achivements/2-Humeurs/2TuNeLachesRien.png',
        title: 'Tu ne lâches rien',
        description: 'Tu as fait 5 sorties notées "Tendu" !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'courage_quotidien',
        image: 'assets/icons/achivements/2-Humeurs/2courageQuotidien.png',
        title: 'Courage Quotidien',
        description: 'Tu as fait 10 sorties notées "Tendu" !',
        unlocked: false,
        dateUnlocked: null,
      },

      // Catégorie Progression
      {
        id: 'petit_mieux',
        image: 'assets/icons/achivements/3-Progression/3PetitMieux.png',
        title: 'Petit Mieux',
        description: 'Une sortie avec une humeur meilleure que la précédente',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'tu_progresses',
        image: 'assets/icons/achivements/3-Progression/3Tuprograsse.png',
        title: 'Tu progresses',
        description: "Tu as fait 5 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'bonne_dynamique',
        image: 'assets/icons/achivements/3-Progression/3BonneDynamique.png',
        title: 'Bonne Dynamique',
        description: "Tu as fait 10 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'ascension_positive',
        image: 'assets/icons/achivements/3-Progression/3AscensionPositive.png',
        title: 'Ascension Positive',
        description: "Tu as fait 20 sorties avec une amélioration d'humeur !",
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'revenir_plus_fort',
        image: 'assets/icons/achivements/3-Progression/3RevenirplusFort.png',
        title: 'Revenir plus Fort',
        description:
          'Tu as fait 1 sortie avec une humeur améliorée après un jour difficile !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'resilience',
        image: 'assets/icons/achivements/3-Progression/3Resilience.png',
        title: 'Résilience',
        description: '3 sorties consécutives après une période tendue',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'transformation',
        image: 'assets/icons/achivements/3-Progression/3Transformation.png',
        title: 'Transformation',
        description: 'Amélioration visible sur un mois',
        unlocked: false,
        dateUnlocked: null,
      },

      // Catégorie Répétitions
      {
        id: 'jours_affillee',
        image: 'assets/icons/achivements/4-Repetitions/4JoursDaffilee.png',
        title: "2 Jours d'affilée",
        description: 'Tu as fait 2 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'toujours_present',
        image: 'assets/icons/achivements/4-Repetitions/4ToujoursPresent.png',
        title: 'Toujours présent',
        description: 'Tu as fait 3 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'rythme_trouve',
        image: 'assets/icons/achivements/4-Repetitions/4RythmeTrouve.png',
        title: 'Rythme Trouvé',
        description: 'Tu as fait 7 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'routine_solide',
        image: 'assets/icons/achivements/4-Repetitions/4RoutineSolide.png',
        title: 'Routine Solide',
        description: 'Tu as fait 14 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'flow_parfait',
        image: 'assets/icons/achivements/4-Repetitions/4FlowParfait.png',
        title: 'Flow Parfait',
        description: 'Tu as fait 21 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'constance',
        image: 'assets/icons/achivements/4-Repetitions/4Constance.png',
        title: 'Constance',
        description: 'Tu as fait 30 sorties consécutives !',
        unlocked: false,
        dateUnlocked: null,
      },

      // Catégorie Objectifs
      {
        id: 'premier_pas',
        image: 'assets/icons/achivements/5-Objectifs/5Premierpas.png',
        title: 'Premier pas',
        description: 'Tu as fait ton premier objectif !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'objectif_atteint',
        image: 'assets/icons/achivements/5-Objectifs/5ObjectifAtteint.png',
        title: 'Objectif Atteint',
        description: 'Tu as terminé 3 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'efficacite_pure',
        image: 'assets/icons/achivements/5-Objectifs/5EfficacitéPure.png',
        title: 'Efficacité Pure',
        description: 'Tu as terminé 5 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'determination',
        image: 'assets/icons/achivements/5-Objectifs/5Determination.png',
        title: 'Détermination',
        description: 'Tu as terminé 10 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
      {
        id: 'maitrise',
        image: 'assets/icons/achivements/5-Objectifs/5Maitrise.png',
        title: 'Maîtrise',
        description: 'Tu as terminé 20 objectifs !',
        unlocked: false,
        dateUnlocked: null,
      },
    ];
  }
  // Vérifie et débloque les badges en fonction du nombre de sorties
  private verifierBadges(sorties: Sortie[]): void {
  const total = sorties.length;
  const badges = this.badgesSubject.getValue();

  // Compte les sorties par catégorie d'humeur
  const tresbien = sorties.filter(s => s.extendedProps?.category === 'tresbien').length;
  const bien = sorties.filter(s => s.extendedProps?.category === 'bien').length;
  const moyen = sorties.filter(s => s.extendedProps?.category === 'moyen').length;
  const anxieuse = sorties.filter(s => s.extendedProps?.category === 'anxieuse').length;

  // Compte les objectifs terminés
  const objectifsTermines = this.objectifsSubject.getValue()
    .filter(o => o.statut === 'terminé').length;

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
  };

  const updated = badges.map((badge) => {
    if (badge.unlocked) return badge;
    if (regles[badge.id]) {
      return { ...badge, unlocked: true, dateUnlocked: new Date().toISOString() };
    }
    return badge;
  });

  this.badgesSubject.next(updated);
  this.saveBadges(updated);
}
}
