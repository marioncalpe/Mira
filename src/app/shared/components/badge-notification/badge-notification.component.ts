import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../core/storage/storage.service';
import { Badge } from '../../../core/models/badge.model';

@Component({
  selector: 'app-badge-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-notification.component.html',
  styleUrls: ['./badge-notification.component.scss'],
})
export class BadgeNotificationComponent implements OnInit {
  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  // Badge à afficher, null = pas de notification
  badge: Badge | null = null;
  // Contrôle l'animation de sortie
  visible = false;

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(private storageService: StorageService) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
    // 🔧 TEST — à supprimer après
    // this.badge = {
    //   id: 'test',
    //   title: 'En mouvement',
    //   description: 'Tu as fait 5 sorties !',
    //   image: 'assets/icons/achivements/1-NombresDeSorties/1EnMouvement.webp',
    //   unlocked: true,
    //   dateUnlocked: new Date().toISOString(),
    // };
    // this.visible = true;
    // 🔧 FIN TEST
    // On s'abonne aux nouveaux badges débloqués
    this.storageService.nouveauBadge$.subscribe((badge) => {
      if (!badge) return;
      this.badge = badge;
      this.visible = true;

      // Disparaît automatiquement après 3 secondes
      setTimeout(() => {
        this.visible = false;
        setTimeout(() => (this.badge = null), 500); // attend la fin de l'animation
      }, 3000);
    });
  }

  fermer(): void {
    this.visible = false;
    setTimeout(() => (this.badge = null), 500);
  }
}
