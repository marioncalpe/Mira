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
  // badge actuellement affiché dans la modal
  // null = pas de modal ouverte
  constructor(private storageService: StorageService) {}

  ngOnInit() {
    // badges$ est un Observable (flux de données)
    // .subscribe() permet de s'y abonner :
    // À chaque fois que les badges changent dans le StorageService,
    // cette fonction est appelée et met à jour le tableau local
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
