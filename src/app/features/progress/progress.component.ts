import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { Sortie } from '../../core/models/sortie.model';
import { StorageService } from '../../core/storage/storage.service';
import { Objectif } from '../../core/models/objectif.model';
import { FormsModule } from '@angular/forms';
import { HeadComponent } from "../../shared/components/head/head.component";

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
    HeadComponent
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

  // Nouvelles stats
  humeurFrequente = '';
  tauxAmelioration = 0;
  sortiesCetteSemaine = 0;

  /*================================*/
  /*      VARIABLES - GRAPHIQUE     */
  /*================================*/
  sortieParMois: { label: string; key: string; count: number }[] = [];
  maxSortiesParMois = 0;
  chartHeight = 120;
  // Offset pour la navigation : 0 = mois actuels, 1 = mois précédents etc.
  graphiqueOffset = 0;
  formatter = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: '2-digit',
  });

  /*================================*/
  /*      VARIABLES - OBJECTIFS     */
  /*================================*/
  objectifsEnCours: Objectif[] = [];
  objectifTermines: Objectif[] = [];
  modalObjectifVisible = false;
  nouveauTitreObjectif = '';

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/
  constructor(private storageService: StorageService) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/
  ngOnInit(): void {
    this.chargerObjectifs();
    this.chargerSorties();
    this.calculerGraphique();
  }

  /*================================*/
  /*        CHARGEMENT DONNÉES      */
  /*================================*/

  private chargerObjectifs(): void {
    this.storageService.objectifs$.subscribe(() => {
      this.objectifsEnCours = this.storageService.getObjectifsEnCours();
      this.objectifTermines = this.storageService.getObjectifsTermines();
    });
  }

  private chargerSorties(): void {
    this.sorties = this.storageService.getSorties();
    this.totalSorties = this.storageService.getTotalSorties();
    this.sortiesCeMois = this.storageService.getSortiesCeMois();
    this.moyenneAvant = this.storageService.getMoyenneAvant();
    this.moyenneApres = this.storageService.getMoyenneApres();
    this.recentesSorties = this.storageService.getRecentesSorties();
    this.maxJoursConsecutifs = this.storageService.getStreak();

    // Humeur la plus fréquente
    this.humeurFrequente = this.calculerHumeurFrequente();

    // Taux d'amélioration
    const avecAmelioration = this.sorties.filter(s =>
      s.extendedProps?.noteApres !== undefined &&
      s.extendedProps?.noteAvant !== undefined &&
      s.extendedProps.noteApres > s.extendedProps.noteAvant
    ).length;
    this.tauxAmelioration = this.sorties.length > 0
      ? Math.round((avecAmelioration / this.sorties.length) * 100)
      : 0;

    // Sorties cette semaine
    const today = new Date();
    const lundiDernier = new Date(today);
    lundiDernier.setDate(today.getDate() - today.getDay() + 1);
    lundiDernier.setHours(0, 0, 0, 0);
    this.sortiesCetteSemaine = this.sorties.filter(s =>
      new Date(s.start) >= lundiDernier
    ).length;
  }

  private calculerHumeurFrequente(): string {
    const compteur: { [key: string]: number } = {
      tresbien: 0, bien: 0, moyen: 0, anxieuse: 0
    };
    this.sorties.forEach(s => {
      const cat = s.extendedProps?.category;
      if (cat && compteur[cat] !== undefined) compteur[cat]++;
    });
    const max = Object.entries(compteur).sort((a, b) => b[1] - a[1])[0];
    const emojis: { [key: string]: string } = {
      tresbien: '😊', bien: '🙂', moyen: '😐', anxieuse: '😰'
    };
    return max[1] > 0 ? emojis[max[0]] : '—';
  }

  calculerGraphique(): void {
    const counts = new Map<string, number>();

    this.sorties.forEach((sortie) => {
      const date = new Date(sortie.start);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const months: { label: string; key: string; count: number }[] = [];

    // On affiche 5 mois en fonction de l'offset
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i - (this.graphiqueOffset * 5));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = this.formatter.format(date);
      const count = counts.get(key) ?? 0;
      months.push({ label, key, count });
    }

    this.sortieParMois = months;
    this.maxSortiesParMois = Math.max(...this.sortieParMois.map(m => m.count), 1);
  }

  /*================================*/
  /*     NAVIGATION GRAPHIQUE       */
  /*================================*/

  // Période précédente (mois plus anciens)
  periodePrec(): void {
    this.graphiqueOffset++;
    this.calculerGraphique();
  }

  // Période suivante (mois plus récents)
  periodeSuiv(): void {
    if (this.graphiqueOffset > 0) {
      this.graphiqueOffset--;
      this.calculerGraphique();
    }
  }

  get estPeriodeActuelle(): boolean {
    return this.graphiqueOffset === 0;
  }

  /*================================*/
  /*        MÉTHODES UTILITAIRES    */
  /*================================*/

  getStars(note: number): boolean[] {
    const fullStars = Math.round(note);
    return Array(5).fill(false).map((_, i) => i < fullStars);
  }

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