import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sortie } from '../models/sortie.model';
import { Objectif } from '../models/objectif.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private sortiesSubject = new BehaviorSubject<Sortie[]>([]);
  private objectifsSubject = new BehaviorSubject<Objectif[]>([]);

  sorties$ = this.sortiesSubject.asObservable();
  objectifs$ = this.objectifsSubject.asObservable();

  constructor() {
    // On récupère les données sauvegardées dans localStorage
    // localStorage ne stocke que du texte, donc les données sont sous forme de string
    // Si rien n'a été sauvegardé, getItem() retourne null
    const sorties = localStorage.getItem('sorties');
    const objectifs = localStorage.getItem('objectifs');

    // Si des sorties existent dans localStorage...
    if (sorties) {
      // JSON.parse() convertit le texte en vrai tableau TypeScript
      // next() met à jour la boîte et notifie tous les composants qui écoutent
      this.sortiesSubject.next(JSON.parse(sorties));
    }

    // Même chose pour les objectifs
    if (objectifs) {
      this.objectifsSubject.next(JSON.parse(objectifs));
    }
  }

  // Sauvegarde les sorties dans localStorage
  private saveSorties(sorties: Sortie[]): void {
    // JSON.stringify() convertit le tableau en texte pour localStorage
    localStorage.setItem('sorties', JSON.stringify(sorties));
  }

  // Sauvegarde les objectifs dans localStorage
  private saveObjectifs(objectifs: Objectif[]): void {
    localStorage.setItem('objectifs', JSON.stringify(objectifs));
  }
  // Retourne la liste actuelle des sorties (sans s'abonner)
  getSorties(): Sortie[] {
    return this.sortiesSubject.getValue();
  }

  // Ajoute une nouvelle sortie
  addSortie(sortie: Sortie): void {
    // On récupère la liste actuelle
    const current = this.sortiesSubject.getValue();
    // On crée un nouveau tableau avec la nouvelle sortie ajoutée
    const updated = [...current, sortie];
    // On met à jour la boîte ET on sauvegarde
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  // Met à jour une sortie existante
  updateSortie(sortie: Sortie): void {
    const updated = this.sortiesSubject
      .getValue()
      .map((s) => (s.id === sortie.id ? sortie : s));
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  // Supprime une sortie
  deleteSortie(id: string): void {
    const updated = this.sortiesSubject.getValue().filter((s) => s.id !== id);
    this.sortiesSubject.next(updated);
    this.saveSorties(updated);
  }

  // Retourne la liste actuelle des objectifs (sans s'abonner)
  getObjectifs(): Objectif[] {
    return this.objectifsSubject.getValue();
  }

  // Ajoute un nouvel objectif
  addObjectif(titre: string): void {
    const newObjectif: Objectif = {
      // Génère un ID unique aléatoire
      id: Math.random().toString(36).substr(2, 9),
      titre,
      statut: 'en cours',
      dateCreation: new Date().toISOString(),
    };
    const current = this.objectifsSubject.getValue();
    const updated = [...current, newObjectif];
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Bascule le statut d'un objectif entre 'en cours' et 'terminé'
  updateObjectif(id: string): void {
    const updated = this.objectifsSubject.getValue().map((obj) => {
      if (obj.id !== id) return obj;
      // Si en cours → terminé, si terminé → en cours
      return obj.statut === 'en cours'
        ? {
            ...obj,
            statut: 'terminé' as const,
            dateValidation: new Date().toISOString(),
          }
        : { ...obj, statut: 'en cours' as const, dateValidation: undefined };
    });
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }

  // Supprime un objectif
  supprimerObjectif(id: string): void {
    const updated = this.objectifsSubject
      .getValue()
      .filter((obj) => obj.id !== id);
    this.objectifsSubject.next(updated);
    this.saveObjectifs(updated);
  }
}
