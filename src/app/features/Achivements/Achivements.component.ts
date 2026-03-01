import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { StorageService } from '../../core/storage/storage.service';
import { Badge } from '../../core/models/badge.model';

@Component({
  selector: 'app-Achivements',
  standalone: true,
  templateUrl: './Achivements.component.html',
  styleUrls: ['./Achivements.component.scss'],
  imports: [CommonModule, MenuComponent, MotivationBannerComponent],
})
export class AchivementsComponent implements OnInit {

  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  // Liste des badges récupérés depuis le StorageService
  badges: Badge[] = [];

  // Badge actuellement affiché dans la modal
  // null = aucune modal ouverte
  selectedTrophy: Badge | null = null;

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(private storageService: StorageService) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
    this.storageService.badges$.subscribe((badges) => {
      this.badges = badges;
    });
  }

  /*================================*/
  /*         ACTIONS - MODAL        */
  /*================================*/

  openTrophy(badge: Badge): void {
    this.selectedTrophy = badge;
  }

  closeModal(): void {
    this.selectedTrophy = null;
  }
}