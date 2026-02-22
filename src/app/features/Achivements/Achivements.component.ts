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
  // Plus de tableau codé en dur, on utilise les badges du storage
  badges: Badge[] = [];
  selectedTrophy: Badge | null = null;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    // On s'abonne aux badges du storage
    // À chaque changement, la liste se met à jour automatiquement
    this.storageService.badges$.subscribe((badges) => {
      this.badges = badges;
    });
  }

  openTrophy(badge: Badge) {
    this.selectedTrophy = badge;
  }

  closeModal() {
    this.selectedTrophy = null;
  }
}
