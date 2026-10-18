import { Badge } from './models/badge.model';

/*================================*/
/*      CATÉGORIES DE BADGES      */
/*  Un seul endroit pour décider  */
/*  quel badge va dans quelle     */
/*  catégorie, et dans quel ordre */
/*================================*/

// Un groupe prêt à être affiché : une catégorie et ses vrais badges
export interface GroupeBadges {
  cle: string;
  emoji: string;
  titre: string;
  badges: Badge[];
  debloques: number;
}

interface DefinitionCategorie {
  cle: string;
  emoji: string;
  titre: string;
  ids: string[]; // les id des badges, dans l'ordre d'affichage
}

// Pour renommer une catégorie, changer leur ordre ou celui des badges : c'est ici.
const CATEGORIES: DefinitionCategorie[] = [
  {
    cle: 'sorties',
    emoji: '🚶',
    titre: 'Nombre de sorties',
    ids: [
      'premiere_sortie',
      'en_mouvement',
      'mira_active',
      'exploratrice',
      'aventurier',
      'nomade',
      'toujours_dehors',
      'marathonien',
      'inarretable',
      'legende_sortie',
    ],
  },
  {
    // Le courage passe avant les "belles sorties"
    cle: 'courage',
    emoji: '💪',
    titre: 'Courage',
    ids: [
      'sortie_courageuse',
      'tu_laches_rien',
      'courage_quotidien',
      'cava_aller',
      'tu_tiens_cap',
      'ressilient',
    ],
  },
  {
    cle: 'belles-sorties',
    emoji: '☀️',
    titre: 'Belles sorties',
    ids: [
      'rayon_soleil',
      'energie_positive',
      'humeur_or',
      'bonne_vibes',
      'optimiste',
      'stable_sereine',
    ],
  },
  {
    cle: 'progression',
    emoji: '📈',
    titre: 'Progression',
    ids: [
      'petit_mieux',
      'tu_progresses',
      'bonne_dynamique',
      'ascension_positive',
      'revenir_plus_fort',
      'resilience',
      'transformation',
    ],
  },
  {
    cle: 'regularite',
    emoji: '🔥',
    titre: 'Régularité',
    ids: [
      'jours_affillee',
      'toujours_present',
      'rythme_trouve',
      'routine_solide',
      'flow_parfait',
      'constance',
    ],
  },
  {
    cle: 'objectifs',
    emoji: '🎯',
    titre: 'Objectifs',
    ids: [
      'premier_pas',
      'objectif_atteint',
      'efficacite_pure',
      'determination',
      'maitrise',
    ],
  },
];

// Range les badges (tels qu'ils sont enregistrés) dans les catégories ci-dessus
export function grouperParCategorie(badges: Badge[]): GroupeBadges[] {
  // Un "Map" retrouve un badge directement par son id. Le ": [string, Badge]"
  // dit à TypeScript que chaque élément est un COUPLE (id, badge).
  const parId = new Map<string, Badge>(
    badges.map((badge): [string, Badge] => [badge.id, badge]),
  );

  const dejaRanges = new Set<string>();

  const groupes: GroupeBadges[] = CATEGORIES.map((categorie) => {
    const badgesDeLaCategorie = categorie.ids
      .map((id) => parId.get(id)) // le badge, ou undefined s'il n'existe pas
      // "badge is Badge" : après ce filtre, il n'y a plus de undefined
      .filter((badge): badge is Badge => badge !== undefined);

    badgesDeLaCategorie.forEach((badge) => dejaRanges.add(badge.id));

    return {
      cle: categorie.cle,
      emoji: categorie.emoji,
      titre: categorie.titre,
      badges: badgesDeLaCategorie,
      debloques: badgesDeLaCategorie.filter((badge) => badge.unlocked).length,
    };
  });

  // Filet de sécurité : un badge pas rangé ne doit jamais disparaître de l'écran
  const autres = badges.filter((badge) => !dejaRanges.has(badge.id));
  if (autres.length > 0) {
    groupes.push({
      cle: 'autres',
      emoji: '✨',
      titre: 'Autres',
      badges: autres,
      debloques: autres.filter((badge) => badge.unlocked).length,
    });
  }

  return groupes;
}