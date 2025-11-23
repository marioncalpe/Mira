import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SortieStorageService } from './core/storage/sortie-storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Mira';

  constructor(private sortieStorageService: SortieStorageService) {}

  async ngOnInit() {
    // Supprime les anciennes données corrompues au démarrage
    // (à commenter ou supprimer une fois le problème résolu)
    // await this.sortieStorageService.deleteAllSorties();
    // console.log('Local storage nettoyé.');
  }
}
