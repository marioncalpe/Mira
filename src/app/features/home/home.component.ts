import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { StorageService } from '../../core/storage/storage.service';
import { Sortie } from '../../core/models/sortie.model';
import { Badge } from '../../core/models/badge.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    MenuComponent,
    MotivationBannerComponent,
    DecimalPipe,
    CommonModule,
  ],
})
export class HomeComponent implements OnInit {

  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  recentesSorties: Sortie[] = [];
  derniersBadges: Badge[] = [];
  totalSorties = 0;
  sortiesCeMois = 0;
  streak = 0;
  moyenneApres = 0;
  nbObjectifsEnCours = 0;
  nbBadgesDebloques = 0;

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(private storageService: StorageService) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
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
    this.totalSorties = this.storageService.getTotalSorties();
    
    
    this.moyenneApres = this.storageService.getMoyenneApres();
  }
}