import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { SortieService } from '../../core/service/sortie.service';
import { Sortie } from '../../core/models/sortie.model';
import { ObjectifService } from '../../core/service/objectif.service';
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
  sorties: Sortie[] = [];
  totalSorties = 0;
  sortiesCeMois = 0;
  moyenneAvant = 0;
  moyenneApres = 0;
  recentesSorties: Sortie[] = [];
  sortieParMois: { label: string; key: string; count: number }[] = [];
  months: { label: string; key: string; count: number }[] = [];
  formatter = new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: '2-digit',
  });
  maxSortiesParMois = 0;
  chartHeight = 120; // hauteur par défaut du graphique en pixels

  AllObjectifs: Objectif[] = [];
  objectifsEnCours: Objectif[] = [];
  objectifTermines: Objectif[] = [];
  modalObjectifVisible = false;
  nouveauTitreObjectif = '';

  constructor(
    private sortieService: SortieService,
    private objectifService: ObjectifService,
  ) {}

  ngOnInit() {
    this.objectifService.objectifs$.subscribe((objectifs) => {
      this.AllObjectifs = objectifs;
      this.objectifsEnCours = this.AllObjectifs.filter(
        (obj) => obj.statut === 'en cours',
      );
      this.objectifTermines = this.AllObjectifs.filter(
        (obj) => obj.statut === 'terminé',
      );
    });
    this.sorties = this.sortieService.getSorties();
    this.totalSorties = this.sorties.length;
    const now = new Date();
    this.sortiesCeMois = this.sorties.filter((sortie) => {
      const date = new Date(sortie.start);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
    const notesAvant = this.sorties
      .map((s) => s.extendedProps?.noteAvant)
      .filter((note): note is number => typeof note === 'number');

    const notesApres = this.sorties
      .map((s) => s.extendedProps?.noteApres)
      .filter((note): note is number => typeof note === 'number');

    this.moyenneAvant = this.average(notesAvant);
    this.moyenneApres = this.average(notesApres);
    this.recentesSorties = [...this.sorties]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, 5);

    const counts = new Map<string, number>();

    this.sorties.forEach((sortie) => {
      const date = new Date(sortie.start);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    for (let i = 4; i >= 0; i--) {
      // 5 => 6 mois
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}`;
      const label = this.formatter.format(date);
      const count = counts.get(key) ?? 0;

      this.months.push({ label, key, count });
    }

    this.sortieParMois = this.months;

    this.maxSortiesParMois = Math.max(
      ...this.sortieParMois.map((m) => m.count),
      1,
    );
    console.log(this.sortieParMois);
  }
  private average(values: number[]): number {
    if (!values.length) {
      return 0;
    }
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
  }
  getBarHeight(count: number) {
    return (count / this.maxSortiesParMois) * this.chartHeight;
  }

  updateObjectif(id: string) {
    this.objectifService.updateObjectif(id);
  }
  ajouterObjectif() {
    this.modalObjectifVisible = true;
  }
  creerObjectif() {
    if (!this.nouveauTitreObjectif.trim()) {
      return; // Ne pas créer d'objectif si le titre est vide
    } else {
      this.objectifService.addObjectif(this.nouveauTitreObjectif);
      this.modalObjectifVisible = false;
      this.nouveauTitreObjectif = ''; // Réinitialiser le champ de saisie
    }
  }
  supprimerObjectif(id: string){
    this.objectifService.supprimerObjectif(id);
  }
}
