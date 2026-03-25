import { Component } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { StorageService } from '../../core/storage/storage.service';
import { HeadComponent } from "../../shared/components/head/head.component";

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [MenuComponent, HeadComponent],
})
export class SettingsComponent {

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(private storageService: StorageService) {}

  /*================================*/
  /*       GESTION DES DONNÉES      */
  /*  Ces méthodes appellent le     */
  /*  StorageService qui contient   */
  /*  toute la logique              */
  /*================================*/

  // Télécharge toutes les données dans un fichier .json
  exporter(): void {
    this.storageService.exportData();
  }

  // Récupère le fichier sélectionné par l'utilisateur
  // et l'envoie au StorageService pour import
  importer(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (fichier) {
      this.storageService.importData(fichier);
    }
  }

  // Efface toutes les données (avec confirmation)
  effacer(): void {
    this.storageService.clearData();
  }
}