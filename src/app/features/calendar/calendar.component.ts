import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  CalendarEvent,
  CalendarDateFormatter,
  CalendarView,
  CalendarMonthViewComponent,
  provideCalendar,
  DateAdapter,
  DAYS_OF_WEEK,
  CalendarPreviousViewDirective,
  CalendarNextViewDirective,
  CalendarDatePipe,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { StorageService } from '../../core/storage/storage.service';
import { Sortie } from '../../core/models/sortie.model';
import { SortieModalComponent } from '../../shared/components/sortie-modal/sortie-modal.component';
import { CustomDateFormatter } from './custom-date-formatter';
import { compterSorties, memeJour, titresDeLaSortie } from '../../core/sorties-utils';

// Au-delà de 3 sorties dans une journée, on affiche 3 points puis un "+"
const MAX_POINTS = 3;

@Component({
  selector: 'app-calendar',
  standalone: true,
  providers: [
    provideCalendar(
      { provide: DateAdapter, useFactory: adapterFactory },
      {
        dateFormatter: {
          provide: CalendarDateFormatter,
          useClass: CustomDateFormatter,
        },
      },
    ),
  ],
  imports: [
    CommonModule,
    SortieModalComponent,
    CalendarMonthViewComponent,
    CalendarPreviousViewDirective,
    CalendarNextViewDirective,
    CalendarDatePipe,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {

  /*================================*/
  /*       VARIABLES - CALENDRIER   */
  /*================================*/

  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  events: CalendarEvent[] = [];
  private allSorties: Sortie[] = [];
  sortiesDuMois: Sortie[] = [];

  /*================================*/
  /*       VARIABLES - MODAL        */
  /*================================*/

  modalVisible = false;
  selectedSortie: Sortie | null = null;
  modalMode: 'view' | 'edit' | 'suppr' | 'create' = 'view';

  /*================================*/
  /*       VARIABLES - CONFIG       */
  /*================================*/

  locale = 'fr';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(
    private storageService: StorageService,
    private route: ActivatedRoute,
  ) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  async ngOnInit(): Promise<void> {
    await this.refreshCalendar();
    // Ouvre la modal si ?openModal=true dans l'URL
    this.route.queryParams.subscribe((params) => {
      if (params['openModal'] === 'true') {
        this.openCreateModal();
      }
    });
  }

  /*================================*/
  /*       CHARGEMENT DONNÉES       */
  /*================================*/

  async refreshCalendar(): Promise<void> {
    this.allSorties = this.storageService.getSorties();

    this.events = this.allSorties.map((sortie: Sortie) => ({
      id: sortie.id,
      title: sortie.title,
      start: new Date(sortie.start),
      // nbSorties : le nombre de points à dessiner sur ce jour
      meta: { ...sortie.extendedProps, nbSorties: compterSorties(sortie) },
      color: this.getColorForSortie(sortie),
    }));

    this.updateSortiesForMonth();
  }

  private updateSortiesForMonth(): void {
    this.sortiesDuMois = this.allSorties
      .filter((s: Sortie) => {
        const d = new Date(s.start);
        return (
          d.getMonth() === this.viewDate.getMonth() &&
          d.getFullYear() === this.viewDate.getFullYear()
        );
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  /*================================*/
  /*       COULEURS ÉVÉNEMENTS      */
  /*================================*/

  private getColorForSortie(sortie: Sortie) {
    switch (sortie.extendedProps?.category) {
      case 'tresbien': return { primary: '#4CAF50', secondary: '#E8F5E9' };
      case 'bien':     return { primary: '#1e90ff', secondary: '#D1E8FF' };
      case 'moyen':    return { primary: '#e3bc08', secondary: '#FDF1BA' };
      case 'anxieuse': return { primary: '#ad2121', secondary: '#FAE3E3' };
      default:         return { primary: '#9E9E9E', secondary: '#F5F5F5' };
    }
  }

  /*================================*/
  /*    POINTS SOUS CHAQUE JOUR     */
  /*  (utilisés par le template     */
  /*   de case du calendrier)       */
  /*================================*/

  // Le nombre total de sorties d'un jour (somme sur ses entrées)
  nombreDeSorties(events: CalendarEvent[]): number {
    return events.reduce((total, event) => total + (event.meta?.nbSorties ?? 1), 0);
  }

  // Un tableau de la bonne longueur : une case = un point à dessiner
  pointsAffiches(events: CalendarEvent[]): number[] {
    const nombre = Math.min(this.nombreDeSorties(events), MAX_POINTS);
    return Array.from({ length: nombre }, (_, index) => index);
  }

  aPlusDePoints(events: CalendarEvent[]): boolean {
    return this.nombreDeSorties(events) > MAX_POINTS;
  }

  // Texte caché pour les lecteurs d'écran ("2 sorties")
  libelleSorties(events: CalendarEvent[]): string {
    const nombre = this.nombreDeSorties(events);
    return `${nombre} ${nombre > 1 ? 'sorties' : 'sortie'}`;
  }

  /*================================*/
  /*         GESTION CLICS          */
  /*================================*/

  // Toucher un jour : s'il y a déjà une entrée, on la consulte ;
  // sinon on en crée une pour ce jour.
  handleDateClick(date: Date): void {
    const sortieDuJour = this.allSorties.find((s) => memeJour(s.start, date));

    if (sortieDuJour) {
      this.selectedSortie = {
        ...sortieDuJour,
        extendedProps: { ...sortieDuJour.extendedProps },
      };
      this.modalMode = 'view';
    } else {
      this.selectedSortie = {
        title: '',
        start: date.toISOString(),
        extendedProps: {},
      };
      this.modalMode = 'edit';
    }
    this.modalVisible = true;
  }

  handleEventClick(event: CalendarEvent): void {
    const sortie = this.allSorties.find((s) => s.id === event.id);
    if (!sortie) return;

    this.selectedSortie = { ...sortie, extendedProps: { ...sortie.extendedProps } };
    this.modalMode = 'view';
    this.modalVisible = true;
  }

  // Bouton + du menu : ajouter une sortie AUJOURD'HUI
  openCreateModal(): void {
    const existante = this.storageService.getSortieDuJour();

    if (existante) {
      // Il y a déjà une entrée aujourd'hui : on l'ouvre en modification,
      // avec une ligne vide en plus (plus de doublon pour le même jour)
      this.selectedSortie = {
        ...existante,
        titres: [...titresDeLaSortie(existante), ''],
        extendedProps: { ...existante.extendedProps },
      };
    } else {
      this.selectedSortie = {
        title: '',
        start: new Date().toISOString(),
        extendedProps: {
          category: '',
          noteAvant: 0,
          noteApres: 0,
          sentiment: '',
        },
      };
    }
    this.modalMode = 'edit';
    this.modalVisible = true;
  }

  /*================================*/
  /*         ACTIONS MODAL          */
  /*================================*/

  onSave(sortie: Sortie): void {
    if (sortie.id) {
      this.storageService.updateSortie(sortie);
    } else {
      sortie.id = crypto.randomUUID();
      this.storageService.addSortie(sortie);
    }
    this.refreshCalendar();
    this.modalVisible = false;
  }

  onDelete(sortie: Sortie): void {
    this.storageService.deleteSortie(sortie.id!);
    this.refreshCalendar();
    this.modalVisible = false;
  }

  onClose(): void {
    this.modalVisible = false;
  }

  onViewDateChange(date: any): void {
    if (date instanceof Date) {
      this.viewDate = date;
    } else if (date?.target?.value) {
      this.viewDate = new Date(date.target.value);
    }
    this.updateSortiesForMonth();
  }
}