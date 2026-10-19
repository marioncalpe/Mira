export interface ExtendedProps {
  category?: string;
  noteAvant?: number;
  noteApres?: number;
  sentiment?: string;
}

export interface Sortie {
  id?: string;
  // Texte de la journée, tous les titres joints par ", ". On le garde :
  // l'accueil, la liste du mois et les anciennes données l'utilisent déjà.
  title: string;
  // Les sorties de la journée, une par ligne. Facultatif : les entrées
  // créées avant cette version n'ont que "title".
  titres?: string[];
  start: string;
  extendedProps: ExtendedProps;
}

export interface StoredSortie {
  id?: string;
  title: string;
  start: string;
  extendedProps: string; // Stockage sous forme de chaîne JSON
}