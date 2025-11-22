export interface Sortie {
  id?: string;
  title: string;
  start: string; // date ISO
  extendedProps: {
    category?: string;
    noteAvant?: number;
    noteApres?: number;
    sentiment?: string;
  };
}
