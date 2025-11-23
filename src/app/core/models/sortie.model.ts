export interface ExtendedProps {
  category?: string;
  noteAvant?: number;
  noteApres?: number;
  sentiment?: string;
}

export interface Sortie {
  id?: string;
  title: string;
  start: string;
  extendedProps: ExtendedProps;
}

export interface StoredSortie {
  id?: string;
  title: string;
  start: string;
  extendedProps: string; // Stockage sous forme de chaîne JSON
}
