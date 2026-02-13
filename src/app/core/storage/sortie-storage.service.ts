import { Injectable } from '@angular/core';
import { Sortie, StoredSortie } from '../models/sortie.model';

/**
 * Service responsable de la gestion
 * du stockage des sorties dans le localStorage.
 *
 * Il s'occupe de :
 * - Sauvegarder
 * - Lire
 * - Mettre à jour
 * - Supprimer
 * les sorties.
 */

@Injectable({
  providedIn: 'root',
})
export class SortieStorageService {
  /**
   * Clé utilisée dans le localStorage
   * pour enregistrer les sorties.
   */
  private readonly STORAGE_KEY = 'sorties';

  constructor() {}

  /**
   * Récupère les données brutes stockées
   * dans le localStorage.
   *
   * @returns Tableau de StoredSortie
   */
   private getStoredSorties(): StoredSortie[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as StoredSortie[];
  }

  /**
   * Sauvegarde un tableau de StoredSortie
   * dans le localStorage.
   */
  private saveStoredSorties(sorties: StoredSortie[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sorties));
  }

  /**
   * Récupère toutes les sorties
   * et les convertit en modèle Sortie
   * utilisable par l'application.
   */
  getSorties(): Sortie[] {
    const stored = this.getStoredSorties();
    return stored.map(s => ({
      ...s,
      extendedProps: s.extendedProps ? JSON.parse(s.extendedProps as unknown as string) : {},
    }));
  }

  /**
   * Ajoute une nouvelle sortie
   * dans le stockage.
   */
  addSortie(sortie: Sortie): Sortie[] {
    const stored = this.getStoredSorties();
    const newStored: StoredSortie = {
      ...sortie,
      extendedProps: JSON.stringify(sortie.extendedProps),
    };
    stored.push(newStored);
    this.saveStoredSorties(stored);
    return this.getSorties();
  }

  /**
   * Met à jour une sortie existante.
   */
  updateSortie(sortie: Sortie): Sortie[] {
    const stored = this.getStoredSorties();
    const idx = stored.findIndex(s => s.id === sortie.id);
    if (idx === -1) return this.getSorties();
    stored[idx] = { ...sortie, extendedProps: JSON.stringify(sortie.extendedProps) };
    this.saveStoredSorties(stored);
    return this.getSorties();
  }

  /**
   * Supprime une sortie du stockage.
   */
  deleteSortie(id: string | number): Sortie[] {
    const updated = this.getStoredSorties().filter(s => s.id !== id);
    this.saveStoredSorties(updated);
    return this.getSorties();
  }
}
