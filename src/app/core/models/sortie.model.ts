export interface Sortie {
  title: string;
  start: string; // date ISO
  extendedProps: {
    category?: string;
    noteAvant?: number;
    noteApres?: number;
    sentiment?: string;
  };
}
