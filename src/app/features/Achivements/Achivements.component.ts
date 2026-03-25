import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { StorageService } from '../../core/storage/storage.service';
import { Badge } from '../../core/models/badge.model';
import { HeadComponent } from "../../shared/components/head/head.component";

@Component({
  selector: 'app-Achivements',
  standalone: true,
  templateUrl: './Achivements.component.html',
  styleUrls: ['./Achivements.component.scss'],
  imports: [CommonModule, MenuComponent, MotivationBannerComponent, HeadComponent],
})
export class AchivementsComponent implements OnInit {
  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  // Liste des badges récupérés depuis le StorageService
  badges: Badge[] = [];
  badgesdebloques = 0;
  nouveauBadge$ = this.storageService.nouveauBadge$;

  // Badge actuellement affiché dans la modal
  // null = aucune modal ouverte
  selectedTrophy: Badge | null = null;

  dernierBadgeId: string | null = null;
  dernierBadge: Badge | null = null;

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

      // On trouve le badge débloqué le plus récemment
      const dernier = [...badges]
        .filter((b) => b.unlocked && b.dateUnlocked)
        .sort(
          (a, b) =>
            new Date(b.dateUnlocked!).getTime() -
            new Date(a.dateUnlocked!).getTime(),
        )[0];

      this.dernierBadgeId = dernier?.id ?? null;
      this.dernierBadge = dernier ?? null; // ← ici, APRÈS la déclaration de dernier
    });

    this.badgesdebloques = this.storageService.getNombreBadgesDebloques();
  }

  // Après ngOnInit, ajoute cette méthode
  // ElementRef permet d'accéder aux éléments HTML du composant
  ngAfterViewInit(): void {
    if (this.dernierBadgeId) {
      const el = document.querySelector('.trophy.newest') as HTMLElement;
      if (el) this.creerParticules(el);
    }
  }

  creerParticules(element: HTMLElement): void {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('span');
      p.classList.add('particule');
      // Position aléatoire autour du badge
      p.style.setProperty('--x', `${Math.random() * 60 - 30}px`);
      p.style.setProperty('--y', `${Math.random() * 60 - 30}px`);
      p.style.setProperty('--delay', `${Math.random() * 2}s`);
      element.appendChild(p);
    }
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
