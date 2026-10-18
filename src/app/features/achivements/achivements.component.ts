import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StorageService } from '../../core/storage/storage.service';
import { Badge } from '../../core/models/badge.model';
import { GroupeBadges, grouperParCategorie } from '../../core/badges-categories';
import { ProchainBadge, estObtenable, trouverProchainBadge } from '../../core/badge-regles';

@Component({
  selector: 'app-Achivements',
  standalone: true,
  templateUrl: './achivements.component.html',
  styleUrls: ['./achivements.component.scss'],
})
export class AchivementsComponent implements OnInit, OnDestroy {

  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  badges: Badge[] = [];
  groupes: GroupeBadges[] = [];
  badgesdebloques = 0;
  totalObtenables = 0; // les badges qui ont une règle (hors "Bientôt")
  pourcentage = 0;
  dernierBadge: Badge | null = null;
  prochain: ProchainBadge | null = null;
  selectedTrophy: Badge | null = null;

  private subscription = new Subscription();

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(private storageService: StorageService) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
    this.subscription.add(
      this.storageService.badges$.subscribe((badges) => {
        this.badges = badges;
        this.groupes = grouperParCategorie(badges);

        // Les badges "Bientôt" ne comptent pas : on ne peut pas les obtenir
        const obtenables = badges.filter((b) => estObtenable(b.id));
        this.totalObtenables = obtenables.length;
        this.badgesdebloques = obtenables.filter((b) => b.unlocked).length;
        this.pourcentage =
          this.totalObtenables > 0
            ? (this.badgesdebloques / this.totalObtenables) * 100
            : 0;

        this.dernierBadge = this.trouverDernierBadge(badges);
        this.prochain = trouverProchainBadge(
          badges,
          this.storageService.getCompteursBadges(),
        );
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /*================================*/
  /*     TEXTES POUR LE TEMPLATE    */
  /*================================*/

  // Phrase du résumé : encourageante, jamais "0/37 (0 %)"
  get libelleGlobal(): string {
    if (this.badgesdebloques === 0) return 'Ta collection commence ici 🌸';
    const s = this.badgesdebloques > 1 ? 's' : '';
    return `${this.badgesdebloques} badge${s} débloqué${s} sur ${this.totalObtenables}`;
  }

  estBientot(badge: Badge): boolean {
    return !estObtenable(badge.id);
  }

  // Description de l'image pour un lecteur d'écran
  descriptionImage(badge: Badge): string {
    if (badge.unlocked) return badge.title;
    return this.estBientot(badge) ? 'Badge bientôt disponible' : 'Badge verrouillé';
  }

  /*================================*/
  /*       MÉTHODES PRIVÉES         */
  /*================================*/

  // Le badge débloqué le plus récemment
  private trouverDernierBadge(badges: Badge[]): Badge | null {
    const debloques = badges.filter((b) => b.unlocked && b.dateUnlocked);
    if (debloques.length === 0) return null;

    // Tri par date, puis par position dans le tableau si même date
    const tries = [...debloques].sort((a, b) => {
      const dateA = new Date(a.dateUnlocked!).getTime();
      const dateB = new Date(b.dateUnlocked!).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return debloques.indexOf(b) - debloques.indexOf(a);
    });

    return tries[0];
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