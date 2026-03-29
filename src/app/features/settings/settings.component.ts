import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { StorageService } from '../../core/storage/storage.service';
import { NotificationService } from '../../core/notification.service';
import { NotificationSettings } from '../../core/models/notification.model';
import { HeadComponent } from "../../shared/components/head/head.component";
import { ThemeService } from '../../core/theme.service';
import { Theme } from '../../core/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [CommonModule, MenuComponent, HeadComponent],
})
export class SettingsComponent implements OnInit {

  themeActuel: Theme = 'light';

  /*================================*/
  /*           VARIABLES            */
  /*================================*/
  notif: NotificationSettings | null = null;

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/
  constructor(
    private storageService: StorageService,
    private notificationService: NotificationService,
    private themeService: ThemeService
  ) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/
  ngOnInit(): void {
    // Charge les préférences de notifications
    this.notif = this.storageService.getNotif();
    // Charge le thème actuel
    this.themeActuel = this.themeService.getTheme();
  }

  basculerTheme(): void {
    this.themeService.toggleTheme();
    this.themeActuel = this.themeService.getTheme();
  }

  /*================================*/
  /*       GESTION DES DONNÉES      */
  /*================================*/

  exporter(): void {
    this.storageService.exportData();
  }

  importer(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (fichier) {
      this.storageService.importData(fichier);
    }
  }

  effacer(): void {
    this.storageService.clearData();
  }

  /*================================*/
  /*         NOTIFICATIONS          */
  /*================================*/

  // Active/désactive le rappel sortie
  toggleSortie(): void {
    if (!this.notif) return;
    this.notif.sortieActive = !this.notif.sortieActive;
  }

  // Active/désactive l'encouragement
  toggleEncouragement(): void {
    if (!this.notif) return;
    this.notif.encouragementActif = !this.notif.encouragementActif;
  }

  // Active/désactive la cohérence cardiaque
  toggleCoherence(): void {
    if (!this.notif) return;
    this.notif.coherenceActive = !this.notif.coherenceActive;
  }

  // Change l'heure du rappel sortie
  changerHeureSortie(event: Event): void {
    if (!this.notif) return;
    this.notif.sortieHeure = (event.target as HTMLInputElement).value;
  }

  // Change l'heure de l'encouragement
  changerHeureEncouragement(event: Event): void {
    if (!this.notif) return;
    this.notif.encouragementHeure = (event.target as HTMLInputElement).value;
  }

  // Change l'heure d'une séance de cohérence cardiaque
  changerHeureCoherence(event: Event, index: number): void {
    if (!this.notif) return;
    this.notif.coherenceHeures[index] = (event.target as HTMLInputElement).value;
  }

  // Sauvegarde et reprogramme toutes les notifications
  sauvegarderNotifs(): void {
    if (!this.notif) return;
    this.storageService.updateNotif(this.notif);
    this.notificationService.programmerTout();
  }
}