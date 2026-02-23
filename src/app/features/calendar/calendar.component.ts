import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { CustomDateFormatter } from './custom-date-formatter';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';

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
    MenuComponent,
    CalendarMonthViewComponent,
    CalendarPreviousViewDirective,
    CalendarNextViewDirective,
    CalendarDatePipe,
    MotivationBannerComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {

  /*================================*/
  /*       VARIABLES - CALENDRIER   */
  /*================================*/

  // Date actuellement affichée dans le calendrier
  viewDate: Date = new Date();

  // Type de vue (Month / Week / Day)
  view: CalendarView = CalendarView.Month;

  // Événements convertis pour angular-calendar
  events: CalendarEvent[] = [];

  // Toutes les sorties récupérées depuis le storage
  private allSorties: Sortie[] = [];

  // Sorties filtrées pour le mois affiché
  sortiesDuMois: Sortie[] = [];

  /*================================*/
  /*       VARIABLES - MODAL        */
  /*================================*/

  modalVisible = false;
  selectedSortie: Sortie | null = null;
  modalMode: 'view' | 'edit' | 'create' = 'view';

  /*================================*/
  /*       VARIABLES - CONFIG       */
  /*================================*/

  locale = 'fr';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(private storageService: StorageService) {}

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  async ngOnInit(): Promise<void> {
    await this.refreshCalendar();
  }

  /*================================*/
  /*       CHARGEMENT DONNÉES       */
  /*================================*/

  // Recharge toutes les sorties et les transforme
  // en événements compatibles avec angular-calendar
  async refreshCalendar(): Promise<void> {
    this.allSorties = this.storageService.getSorties();

    this.events = this.allSorties.map((sortie: Sortie) => ({
      id: sortie.id,
      title: sortie.title,
      start: new Date(sortie.start),
      meta: { ...sortie.extendedProps },
      color: this.getColorForSortie(sortie),
    }));

    this.updateSortiesForMonth();
  }

  // Met à jour la liste des sorties du mois affiché
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
  /*  Couleur selon la catégorie    */
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
  /*         GESTION CLICS          */
  /*================================*/

  // Clic sur une date : ouvre en mode vue si sortie existante,
  // sinon ouvre en mode création
  handleDateClick(date: Date): void {
    const existingEvent = this.events.find((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });

    if (existingEvent) {
      this.selectedSortie = {
        id: existingEvent.id as string,
        title: existingEvent.title,
        start: existingEvent.start.toISOString(),
        extendedProps: { ...(existingEvent.meta ?? {}) },
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

  // Clic sur un événement existant : ouvre en mode vue
  handleEventClick(event: CalendarEvent): void {
    this.selectedSortie = {
      id: event.id as string,
      title: event.title,
      start: event.start.toISOString(),
      extendedProps: { ...(event.meta ?? {}) },
    };
    this.modalMode = 'view';
    this.modalVisible = true;
  }

  // Ouvre la modal en mode création avec des valeurs par défaut
  openCreateModal(): void {
    this.selectedSortie = {
      title: 'Nouvelle sortie',
      start: new Date().toISOString(),
      extendedProps: {
        category: 'calme',
        noteAvant: 1,
        noteApres: 1,
        sentiment: 'positif',
      },
    };
    this.modalMode = 'edit';
    this.modalVisible = true;
  }

  /*================================*/
  /*         ACTIONS MODAL          */
  /*================================*/

  // Sauvegarde : update si id existant, création sinon
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

  // Supprime la sortie et rafraîchit le calendrier
  onDelete(sortie: Sortie): void {
    this.storageService.deleteSortie(sortie.id!);
    this.refreshCalendar();
    this.modalVisible = false;
  }

  // Ferme la modal sans sauvegarder
  onClose(): void {
    this.modalVisible = false;
  }

  // Mise à jour de la date affichée (changement de mois)
  onViewDateChange(date: any): void {
    if (date instanceof Date) {
      this.viewDate = date;
    } else if (date?.target?.value) {
      this.viewDate = new Date(date.target.value);
    }
    this.updateSortiesForMonth();
  }
}