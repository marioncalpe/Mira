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

  badges: Badge[] = [];
  badgesdebloques = 0;
  nouveauBadge$ = this.storageService.nouveauBadge$;
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

      // Nombre de badges débloqués
      this.badgesdebloques = badges.filter(b => b.unlocked).length;

      // Badges débloqués avec une date valide
      const badgesDebloques = badges.filter(b => b.unlocked && b.dateUnlocked);

      if (badgesDebloques.length === 0) {
        this.dernierBadge = null;
        this.dernierBadgeId = null;
        return;
      }

      // Tri par date, puis par position dans le tableau si même date
      const dernier = [...badgesDebloques].sort((a, b) => {
        const dateA = new Date(a.dateUnlocked!).getTime();
        const dateB = new Date(b.dateUnlocked!).getTime();
        if (dateB !== dateA) return dateB - dateA;
        // Même date → on prend le dernier dans l'ordre du tableau
        return badgesDebloques.indexOf(b) - badgesDebloques.indexOf(a);
      })[0];

      this.dernierBadgeId = dernier?.id ?? null;
      this.dernierBadge = dernier ?? null;
    });
  }

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