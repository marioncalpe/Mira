import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Objectif } from '../models/objectif.model';

@Injectable({
  providedIn: 'root',
})
export class ObjectifService {
  private objectifSubject = new BehaviorSubject<Objectif[]>([]);
  objectifs$ = this.objectifSubject.asObservable();

  constructor() {
    const stored = localStorage.getItem('objectifs');
    if(stored == null){
      console.log('Aucun objectif trouvé, initialisation avec un tableau vide.');
    } else {
      this.objectifSubject.next(JSON.parse(stored) as Objectif[]);
    }
  }

  sauvegarder(objectifs: Objectif[]) {
    localStorage.setItem('objectifs', JSON.stringify(objectifs));
  }

  addObjectif(titre: string) {
    const newObjectif: Objectif = {
      id: Math.random().toString(36).substr(2, 9), // Génère un ID aléatoire simple
      titre,
      statut: 'en cours',
      dateCreation: new Date().toISOString(),
    };
    const currentObjectifs = this.objectifSubject.getValue(); 
    this.objectifSubject.next([...currentObjectifs, newObjectif]);
    this.sauvegarder([...currentObjectifs, newObjectif]);
  }
  updateObjectif(id : string) {
    const list = this.objectifSubject.getValue();
    const updated = list.map(obj=> {
      if(obj.id === id){
        if(obj.statut === 'en cours') return {
          ...obj,
          statut: 'terminé' as const,
          dateValidation: new Date().toISOString()
        } as Objectif;
        else return {
          ...obj,
          statut: 'en cours' as const,
          dateValidation: undefined
        } as Objectif;
      }
      return obj;
    })
    this.objectifSubject.next(updated);
    this.sauvegarder(updated);
  }

  supprimerObjectif(id: string) {
    const list = this.objectifSubject.getValue();
    const suppr = list.filter(obj => obj.id !== id);
    this.objectifSubject.next(suppr);
    this.sauvegarder(suppr);
  }
}
