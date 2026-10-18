import { Badge } from './models/badge.model';

/*================================*/
/*        RÈGLES DE BADGES        */
/*  Une règle = un compteur et    */
/*  une cible. Cette table sert à */
/*  débloquer les badges ET à     */
/*  afficher leur progression.    */
/*================================*/

// Les valeurs qu'on sait compter dans l'appli
export type Compteur =
  | 'total' // nombre de sorties
  | 'tresbien' // sorties notées "Très bien"
  | 'bien' // sorties notées "Bien"
  | 'moyen' // sorties notées "Moyen"
  | 'anxieuse' // sorties notées "Anxieuse"
  | 'objectifs' // objectifs terminés
  | 'consecutifs' // record de jours d'affilée
  | 'ameliorations'; // sorties où la note après dépasse la note avant

// Une valeur pour chaque compteur
export type CompteursBadges = Record<Compteur, number>;

export interface RegleBadge {
  compteur: Compteur;
  cible: number;
}

// Un badge ABSENT de cette table n'a pas de règle : il est "Bientôt".
// Pour activer "revenir_plus_fort" plus tard : ajouter sa ligne ici
// (et le compteur qui lui correspond dans le service de stockage).
export const REGLES_BADGES: Record<string, RegleBadge> = {
  // Nombre de sorties
  premiere_sortie: { compteur: 'total', cible: 1 },
  en_mouvement: { compteur: 'total', cible: 5 },
  mira_active: { compteur: 'total', cible: 10 },
  exploratrice: { compteur: 'total', cible: 20 },
  aventurier: { compteur: 'total', cible: 30 },
  nomade: { compteur: 'total', cible: 50 },
  toujours_dehors: { compteur: 'total', cible: 75 },
  marathonien: { compteur: 'total', cible: 100 },
  inarretable: { compteur: 'total', cible: 150 },
  legende_sortie: { compteur: 'total', cible: 200 },
  // Humeurs
  rayon_soleil: { compteur: 'tresbien', cible: 5 },
  energie_positive: { compteur: 'tresbien', cible: 15 },
  humeur_or: { compteur: 'tresbien', cible: 30 },
  bonne_vibes: { compteur: 'bien', cible: 5 },
  optimiste: { compteur: 'bien', cible: 10 },
  stable_sereine: { compteur: 'bien', cible: 25 },
  cava_aller: { compteur: 'moyen', cible: 5 },
  tu_tiens_cap: { compteur: 'moyen', cible: 15 },
  ressilient: { compteur: 'moyen', cible: 30 },
  sortie_courageuse: { compteur: 'anxieuse', cible: 1 },
  tu_laches_rien: { compteur: 'anxieuse', cible: 5 },
  courage_quotidien: { compteur: 'anxieuse', cible: 10 },
  // Objectifs
  premier_pas: { compteur: 'objectifs', cible: 1 },
  objectif_atteint: { compteur: 'objectifs', cible: 3 },
  efficacite_pure: { compteur: 'objectifs', cible: 5 },
  determination: { compteur: 'objectifs', cible: 10 },
  maitrise: { compteur: 'objectifs', cible: 20 },
  // Jours consécutifs
  jours_affillee: { compteur: 'consecutifs', cible: 2 },
  toujours_present: { compteur: 'consecutifs', cible: 3 },
  rythme_trouve: { compteur: 'consecutifs', cible: 7 },
  routine_solide: { compteur: 'consecutifs', cible: 14 },
  flow_parfait: { compteur: 'consecutifs', cible: 21 },
  constance: { compteur: 'consecutifs', cible: 30 },
  // Amélioration
  petit_mieux: { compteur: 'ameliorations', cible: 1 },
  tu_progresses: { compteur: 'ameliorations', cible: 5 },
  bonne_dynamique: { compteur: 'ameliorations', cible: 10 },
  ascension_positive: { compteur: 'ameliorations', cible: 20 },
};

// Pour écrire "Encore 3 sorties" / "Encore 1 sortie"
const LIBELLES: Record<Compteur, { un: string; plusieurs: string }> = {
  total: { un: 'sortie', plusieurs: 'sorties' },
  tresbien: { un: 'sortie « Très bien »', plusieurs: 'sorties « Très bien »' },
  bien: { un: 'sortie « Bien »', plusieurs: 'sorties « Bien »' },
  moyen: { un: 'sortie « Moyen »', plusieurs: 'sorties « Moyen »' },
  anxieuse: { un: 'sortie « Anxieuse »', plusieurs: 'sorties « Anxieuse »' },
  objectifs: { un: 'objectif terminé', plusieurs: 'objectifs terminés' },
  consecutifs: { un: "jour d'affilée", plusieurs: "jours d'affilée" },
  ameliorations: { un: 'sortie avec amélioration', plusieurs: 'sorties avec amélioration' },
};

// Ce badge peut-il être débloqué ? (faux = "Bientôt")
export function estObtenable(idBadge: string): boolean {
  return Object.hasOwn(REGLES_BADGES, idBadge);
}

/*================================*/
/*        PROCHAIN BADGE          */
/*================================*/

export interface ProchainBadge {
  badge: Badge;
  valeur: number; // où tu en es (ex. 4)
  cible: number; // où il faut arriver (ex. 5)
  phrase: string; // "Encore 1 sortie"
}

// Le badge non débloqué dont tu es PROPORTIONNELLEMENT le plus proche
export function trouverProchainBadge(
  badges: Badge[],
  compteurs: CompteursBadges,
): ProchainBadge | null {
  let meilleur: ProchainBadge | null = null;
  let meilleurRatio = -1;

  for (const badge of badges) {
    if (badge.unlocked) continue;

    // On écrit le type "RegleBadge | undefined" : un badge peut ne pas avoir de règle
    const regle: RegleBadge | undefined = REGLES_BADGES[badge.id];
    if (!regle) continue; // "Bientôt" : on ne le propose pas

    const valeur = compteurs[regle.compteur];
    const restant = regle.cible - valeur;
    if (restant <= 0) continue; // sera débloqué à la prochaine vérification

    const ratio = valeur / regle.cible;
    // ">" strict : à égalité, on garde le premier de la liste
    if (ratio > meilleurRatio) {
      meilleurRatio = ratio;
      const libelle = LIBELLES[regle.compteur];
      meilleur = {
        badge,
        valeur,
        cible: regle.cible,
        phrase: `Encore ${restant} ${restant > 1 ? libelle.plusieurs : libelle.un}`,
      };
    }
  }

  return meilleur;
}