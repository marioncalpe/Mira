import { Injectable } from '@angular/core';
import { Sortie } from '../models/sortie.model';
import { CalendarEvent } from 'angular-calendar';

@Injectable({ providedIn: 'root' })
export class SortieService {
  private STORAGE_KEY = 'sorties';

  getSorties(): Sortie[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  saveSorties(sorties: Sortie[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sorties));
  }

  addSortie(sortie: Sortie) {
    const sorties = this.getSorties();
    sorties.push(sortie);
    this.saveSorties(sorties);
  }

  updateSortie(updated: Sortie) {
    const sorties = this.getSorties().map((s) =>
      s.start === updated.start && s.title === updated.title ? updated : s
    );
    this.saveSorties(sorties);
  }

  deleteSortie(sortie: Sortie) {
    const sorties = this.getSorties().filter(
      (s) => !(s.start === sortie.start && s.title === sortie.title)
    );
    this.saveSorties(sorties);
  }

  // Dans SortieService
  toCalendarEvent(sortie: Sortie): CalendarEvent {
    return {
      title: sortie.title,
      start: new Date(sortie.start),
      color: this.getColorForSortie(sortie),
      allDay: false,
      meta: sortie.extendedProps, // Stocke les propriétés étendues
    };
  }

  private getColorForSortie(sortie: Sortie): {
    primary: string;
    secondary: string;
  } {
    // Exemple : Choisir une couleur en fonction de la catégorie
    switch (sortie.extendedProps?.category) {
      case 'travail':
        return { primary: '#ad2121', secondary: '#FAE3E3' };
      case 'loisir':
        return { primary: '#1e90ff', secondary: '#D1E8FF' };
      default:
        return { primary: '#e3bc08', secondary: '#FDF1BA' };
    }
  }
}
