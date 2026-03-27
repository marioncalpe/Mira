import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BadgeNotificationComponent } from './shared/components/badge-notification/badge-notification.component';
import { NotificationService } from './core/notification.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BadgeNotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Mira';

  constructor(private notificationService: NotificationService) {
    this.notificationService.programmerTout();
  }

  async ngOnInit() {
    // Supprime les anciennes données corrompues au démarrage
    // (à commenter ou supprimer une fois le problème résolu)
    // await this.sortieStorageService.deleteAllSorties();
    // console.log('Local storage nettoyé.');
  }
  
}
