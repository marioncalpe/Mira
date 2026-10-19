import { Sortie } from './models/sortie.model';

/*================================*/
/*        OUTILS "SORTIES"        */
/*  Petites fonctions partagées   */
/*  par le calendrier, la modale  */
/*  et le service de stockage     */
/*================================*/

const UN_JOUR_MS = 86400000; // 24h en millisecondes

// Le numéro de jour d'une date (un entier) : l'heure est ignorée.
// "string | Date" = on accepte un texte ISO ou un objet Date.
export function numeroDeJour(date: string | Date): number {
  const d = new Date(date);
  // On part des éléments LOCAUX (année, mois, jour) : l'heure de la sortie
  // et le changement d'heure n'ont plus aucun effet.
  const minuit = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round(minuit / UN_JOUR_MS);
}

export function memeJour(a: string | Date, b: string | Date): boolean {
  return numeroDeJour(a) === numeroDeJour(b);
}

// Les titres d'une entrée, tels qu'ils sont enregistrés (peut contenir
// des lignes vides, utile pendant la saisie).
// Une ancienne entrée n'a que "title" : on en fait une liste d'un élément.
export function titresDeLaSortie(sortie: Sortie): string[] {
  if (sortie.titres && sortie.titres.length > 0) return sortie.titres;
  const titre = (sortie.title ?? '').trim();
  return titre ? [titre] : [];
}

// Enlève les espaces autour et les lignes vides
export function nettoyerTitres(titres: string[]): string[] {
  return titres.map((t) => t.trim()).filter((t) => t.length > 0);
}

// "Papa, Campo, Paillote" : le texte de la journée
export function titreDepuisListe(titres: string[]): string {
  return nettoyerTitres(titres).join(', ');
}

// Nombre de sorties d'une entrée, au moins 1 (un jour enregistré sans titre
// compte quand même pour une sortie : un point dans le calendrier)
export function compterSorties(sortie: Sortie): number {
  return Math.max(1, nettoyerTitres(titresDeLaSortie(sortie)).length);
}