import { Badge } from './models/badge.model';

/*================================*/
/*       FUSION DES BADGES        */
/*  Le CODE décrit les badges     */
/*  (titre, texte, image). Ce qui */
/*  est enregistré ne sert qu'à   */
/*  retenir l'ÉTAT : débloqué ou  */
/*  non, et à quelle date.        */
/*================================*/

export function fusionnerBadges(enregistres: Badge[], parDefaut: Badge[]): Badge[] {
  // Les badges enregistrés, retrouvables directement par leur id
  const parId = new Map<string, Badge>(
    enregistres.map((badge): [string, Badge] => [badge.id, badge]),
  );

  // 1. Pour chaque badge de la liste actuelle (dans son ordre) :
  //    titre, description et image viennent du code ;
  //    l'état (débloqué ou non, date) vient de l'enregistrement s'il existe.
  const fusionnes: Badge[] = parDefaut.map((badge) => {
    const ancien = parId.get(badge.id);
    if (!ancien) return badge; // badge nouveau : verrouillé

    return {
      ...badge,
      unlocked: ancien.unlocked === true,
      dateUnlocked: ancien.dateUnlocked ?? null,
    };
  });

  // 2. Un badge enregistré mais qui n'existe plus dans le code :
  //    - s'il était obtenu, on le garde (une récompense ne se retire pas) ;
  //    - sinon il disparaît.
  const idsActuels = new Set(parDefaut.map((badge) => badge.id));
  const obtenusSupprimes = enregistres.filter(
    (badge) => badge.unlocked === true && !idsActuels.has(badge.id),
  );

  return [...fusionnes, ...obtenusSupprimes];
}