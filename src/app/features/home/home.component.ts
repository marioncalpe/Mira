import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, ActivatedRoute, Router  } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { HeadComponent } from '../../shared/components/head/head.component';
import { StorageService } from '../../core/storage/storage.service';
import { Sortie } from '../../core/models/sortie.model';
import { Badge } from '../../core/models/badge.model';
import { Note } from '../../core/models/note.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    MenuComponent,
    MotivationBannerComponent,
    HeadComponent,
    DecimalPipe,
    CommonModule,
    RouterLink, RouterLinkActive, FormsModule
  ],
})
export class HomeComponent implements OnInit, OnDestroy {

  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  prenom = '';
  recentesSorties: Sortie[] = [];
  derniersBadges: Badge[] = [];
  totalSorties = 0;
  sortiesCeMois = 0;
  streak = 0;
  moyenneApres = 0;
  nbObjectifsEnCours = 0;
  nbBadgesDebloques = 0;
  notes: Note[] = [];
  modalNoteVisible = false;
  noteEnEdition: Note | null = null;
  nouveauTitreNote = '';
  nouveauContenuNote = '';

  // Conteneur qui regroupe tous les abonnements RxJS de ce composant,
  // pour pouvoir tous les désinscrire d'un coup dans ngOnDestroy
  private subscriptions = new Subscription();

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(private storageService: StorageService) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
    this.subscriptions.add(
      this.storageService.prenom$.subscribe(prenom => this.prenom = prenom)
    );
    // NB sortie du mois
    this.sortiesCeMois = this.storageService.getSortiesCeMois();
    // STEAK
    this.streak = this.storageService.getStreak();
    // Nb objectifs en cours
    this.nbObjectifsEnCours = this.storageService.getNombreObjectifsEnCours();
    // Nb total badges débloqués
    this.nbBadgesDebloques = this.storageService.getNombreBadgesDebloques();
    this.recentesSorties = this.storageService.getRecentesSorties();
    this.derniersBadges = this.storageService.getDerniersBadges();
    this.notes = this.storageService.getNotes();
    this.subscriptions.add(
      this.storageService.notes$.subscribe(notes => this.notes = notes)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

// Méthodes
ajouterNote(): void {
  this.noteEnEdition = null;
  this.nouveauTitreNote = '';
  this.nouveauContenuNote = '';
  this.modalNoteVisible = true;
}

editerNote(note: Note): void {
  this.noteEnEdition = note;
  this.nouveauTitreNote = note.titre;
  this.nouveauContenuNote = note.contenu;
  this.modalNoteVisible = true;
}

sauvegarderNote(): void {
  if (!this.nouveauTitreNote.trim()) return;
  if (this.noteEnEdition) {
    this.storageService.updateNote(this.noteEnEdition.id, this.nouveauTitreNote, this.nouveauContenuNote);
  } else {
    this.storageService.addNote(this.nouveauTitreNote, this.nouveauContenuNote);
  }
  this.modalNoteVisible = false;
}

supprimerNote(id: string): void {
  this.storageService.deleteNote(id);
  }
}