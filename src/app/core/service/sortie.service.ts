import { Injectable } from '@angular/core';
import { Sortie } from '../models/sortie.model';
import { SortieStorageService } from '../storage/sortie-storage.service';

@Injectable({ providedIn: 'root' })
export class SortieService {
  constructor(private storage: SortieStorageService) {}

  getSorties() {
    return this.storage.getSorties();
  }

  addSortie(sortie: Sortie) {
    return this.storage.addSortie(sortie);
  }

  updateSortie(sortie: Sortie) {
    return this.storage.updateSortie(sortie);
  }

  deleteSortie(sortie: Sortie) {
    return this.storage.deleteSortie(sortie.id!);
  }
}
