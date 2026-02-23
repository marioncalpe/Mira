import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { Sortie } from '../../core/models/sortie.model';
import { StorageService } from '../../core/storage/storage.service';
import { Objectif } from '../../core/models/objectif.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-progress',
  standalone: true,
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  imports: [
    MenuComponent,
    MotivationBannerComponent,
    DecimalPipe,
    CommonModule,
    FormsModule,
  ],
})
export class ProgressComponent implements OnInit {

  /*================================*/
  /*       VARIABLES - SORTIES      */
  /*================================*/
  sorties: Sortie[] = [];
  totalSorties = 0;
  sortiesCeMois = 0;
  moyenneAvant = 0;
  moyenneApres = 0;
  maxJoursConsecutifs = 0;
  recentesSorties: Sortie[] = [];

  /*================================*/
  /*      VARIABLES - GRAPHIQUE     */
  /*================================*/
  sortieParMois: { label: string; key: string; count: number }[] = [];
  months: { label: string; key: string; count: number }[] = [];
  maxSortiesParMois = 0;
  chartHeight = 120; // Hauteur max du graphique en pixels
  formatter = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: '2-digit',
  });

  /*================================*/
  /*      VARIABLES - OBJECTIFS     */
  /*================================*/
  AllObjectifs: Objectif[] = [];
  objectifsEnCours: Objectif[] = [];
  objectifTermines: Objectif[] = [];
  modalObjectifVisible = false;
  nouveauTitreObjectif = '';

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/
  constructor(private storageService: StorageService) {}

  /*================================*/
  /*           NGONINIT             */
  /*  S'exécute au chargement du    */
  /*  composant                     */
  /*================================*/
  ngOnInit() {
    this.chargerObjectifs();
    this.chargerSorties();
    this.calculerGraphique();
  }

  /*================================*/
  /*        CHARGEMENT DONNÉES      */
  /*================================*/

  // S'abonne aux objectifs du storage
  // Se met à jour automatiquement si les objectifs changent
  private chargerObjectifs(): void {
    this.storageService.objectifs$.subscribe((objectifs) => {
      this.AllObjectifs = objectifs;
      this.objectifsEnCours = objectifs.filter(obj => obj.statut === 'en cours');
      this.objectifTermines = objectifs.filter(obj => obj.statut === 'terminé');
    });
  }

  // Charge et calcule toutes les stats liées aux sorties
  private chargerSorties(): void {
    this.sorties = this.storageService.getSorties();
    this.totalSorties = this.sorties.length;

    // Sorties du mois en cours
    const now = new Date();
    this.sortiesCeMois = this.sorties.filter((sortie) => {
      const date = new Date(sortie.start);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    // Moyennes des notes avant/après
    const notesAvant = this.sorties
      .map(s => s.extendedProps?.noteAvant)
      .filter((note): note is number => typeof note === 'number');
    const notesApres = this.sorties
      .map(s => s.extendedProps?.noteApres)
      .filter((note): note is number => typeof note === 'number');

    this.moyenneAvant = this.average(notesAvant);
    this.moyenneApres = this.average(notesApres);

    // 5 sorties les plus récentes pour l'historique
    this.recentesSorties = [...this.sorties]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, 5);

    // Record de jours consécutifs
    this.maxJoursConsecutifs = this.storageService.getMaxJoursConsecutifs(this.sorties);
  }

  // Calcule les données du graphique (6 derniers mois)
  private calculerGraphique(): void {
    const counts = new Map<string, number>();

    this.sorties.forEach((sortie) => {
      const date = new Date(sortie.start);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = this.formatter.format(date);
      const count = counts.get(key) ?? 0;
      this.months.push({ label, key, count });
    }

    this.sortieParMois = this.months;
    this.maxSortiesParMois = Math.max(...this.sortieParMois.map(m => m.count), 1);
  }

  /*================================*/
  /*        MÉTHODES UTILITAIRES    */
  /*================================*/

  // Calcule la moyenne d'un tableau de nombres
  private average(values: number[]): number {
    if (!values.length) return 0;
    return values.reduce((acc, value) => acc + value, 0) / values.length;
  }

  // Calcule la hauteur d'une barre du graphique en pixels
  getBarHeight(count: number): number {
    return (count / this.maxSortiesParMois) * this.chartHeight;
  }

  /*================================*/
  /*       ACTIONS - OBJECTIFS      */
  /*================================*/

  updateObjectif(id: string): void {
    this.storageService.updateObjectif(id);
  }

  ajouterObjectif(): void {
    this.modalObjectifVisible = true;
  }

  creerObjectif(): void {
    if (!this.nouveauTitreObjectif.trim()) return;
    this.storageService.addObjectif(this.nouveauTitreObjectif);
    this.modalObjectifVisible = false;
    this.nouveauTitreObjectif = '';
  }

  supprimerObjectif(id: string): void {
    this.storageService.supprimerObjectif(id);
  }
}