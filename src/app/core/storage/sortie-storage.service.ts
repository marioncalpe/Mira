import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Sortie } from '../models/sortie.model';

@Injectable({ providedIn: 'root' })
export class SortieStorageService {
  private readonly KEY = 'sorties';

  constructor(private storage: StorageService) {}

  getSorties(): Sortie[] {
    return this.storage.get<Sortie[]>(this.KEY) ?? [];
  }

  saveSorties(sorties: Sortie[]): void {
    this.storage.set(this.KEY, sorties);
  }

  addSortie(sortie: Sortie): void {
    const sorties = this.getSorties();
    sorties.push(sortie);
    this.saveSorties(sorties);
  }

  updateSortie(sortie: Sortie): void {
    const sorties = this.getSorties().map(s =>
      s.id === sortie.id ? sortie : s
    );
    this.saveSorties(sorties);
  }

  deleteSortie(id: string): void {
    const sorties = this.getSorties().filter(s => s.id !== id);
    this.saveSorties(sorties);
  }

  deleteAllSorties(): void {
    this.storage.remove(this.KEY);
  }
}
