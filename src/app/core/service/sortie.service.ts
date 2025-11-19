import { Injectable } from '@angular/core';
import { Sortie } from '../models/sortie.model';

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
    const sorties = this.getSorties().map(s =>
      s.start === updated.start && s.title === updated.title ? updated : s
    );
    this.saveSorties(sorties);
  }

  deleteSortie(sortie: Sortie) {
    const sorties = this.getSorties().filter(
      s => !(s.start === sortie.start && s.title === sortie.title)
    );
    this.saveSorties(sorties);
  }
}
