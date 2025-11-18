// src/app/core/sortie.model.ts
import { EventInput } from '@fullcalendar/core';

export interface Sortie extends EventInput {
  extendedProps: {
    noteAvant?: number;
    notePendant?: number;
    sentiment?: string;
    category?: string;
  };
}
