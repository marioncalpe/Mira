/**
 * Composant principal du calendrier.
 *
 * Gère :
 * - L'affichage des sorties dans angular-calendar
 * - L'ouverture de la modal (view / edit / create)
 * - La synchronisation avec le StorageService
 * - Le filtrage des sorties du mois en cours
 */

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
  // Date actuellement affichée dans le calendrier
  viewDate: Date = new Date();

  // Type de vue (Month / Week / Day)
  view: CalendarView = CalendarView.Month;

  // Liste des événements convertis pour angular-calendar
  events: CalendarEvent[] = [];

  // Toutes les sorties récupérées depuis le storage
  private allSorties: Sortie[] = [];

  // Sorties filtrées pour le mois affiché
  sortiesDuMois: Sortie[] = [];

  modalVisible = false;
  selectedSortie: Sortie | null = null;
  locale = 'fr';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];
  modalMode: 'view' | 'edit' | 'create' = 'view';

  constructor(private storageService: StorageService) {}

  // Au démarrage du composant, on recharge le calendrier pour afficher les sorties
  async ngOnInit() {
    await this.refreshCalendar();
  }

  /**
   * Recharge toutes les sorties depuis le service
   * puis les transforme en événements compatibles
   * avec angular-calendar.
   */
  async refreshCalendar() {
    this.allSorties = this.storageService.getSorties();

    // Transformation des Sorties en CalendarEvent
    this.events = this.allSorties.map((sortie: Sortie) => ({
      id: sortie.id,
      title: sortie.title,
      start: new Date(sortie.start),
      meta: { ...sortie.extendedProps },
      color: this.getColorForSortie(sortie),
    }));

    this.updateSortiesForMonth();
  }

  /**
   * Retourne la couleur de l'événement
   * en fonction de la catégorie de la sortie.
   */
  private getColorForSortie(sortie: Sortie) {
    switch (sortie.extendedProps?.category) {
      case 'travail':
        return { primary: '#ad2121', secondary: '#FAE3E3' };
      case 'loisir':
        return { primary: '#1e90ff', secondary: '#D1E8FF' };
      default:
        return { primary: '#e3bc08', secondary: '#FDF1BA' };
    }
  }

  /**
   * Gère le clic sur une date du calendrier.
   *
   * - Si un événement existe déjà ce jour-là → ouvre en mode "view"
   * - Sinon → ouvre la modal en mode création
   */
  handleDateClick(date: Date) {
    // Vérifie si un événement existe déjà pour cette date
    const existingEvent = this.events.find((event) => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
    if (existingEvent) {
      // Si un événement existe, ouvre la modalité en mode "view"
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

  /**
   * Gère le clic sur un événement existant.
   * Ouvre la modal en mode consultation.
   */
  handleEventClick(event: CalendarEvent) {
    this.selectedSortie = {
      id: event.id as string,
      title: event.title,
      start: event.start.toISOString(),
      extendedProps: { ...(event.meta ?? {}) },
    };

    this.modalMode = 'view'; // 👉 mode VIEW
    this.modalVisible = true;
  }

  openCreateModal() {
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

    this.modalMode = 'edit'; // 👉 mode EDIT
    this.modalVisible = true;
  }

  /**
   * Sauvegarde une sortie.
   *
   * - Si elle possède un id → update
   * - Sinon → création d'une nouvelle sortie
   */
  onSave(sortie: Sortie) {
    if (sortie.id) {
      this.storageService.updateSortie(sortie);
    } else {
      sortie.id = crypto.randomUUID();
      this.storageService.addSortie(sortie);
    }

    this.refreshCalendar();
    this.modalVisible = false;
  }

  onDelete(sortie: Sortie) {
    this.storageService.deleteSortie(sortie.id!);
    this.refreshCalendar();
    this.modalVisible = false;
  }

  onClose() {
    this.modalVisible = false;
  }

  onViewDateChange(date: any) {
    // Correction : accepte Event ou Date
    if (date instanceof Date) {
      this.viewDate = date;
    } else if (date && date.target && date.target.value) {
      this.viewDate = new Date(date.target.value);
    }
    this.updateSortiesForMonth();
  }

  /**
   * Met à jour la liste des sorties
   * correspondant uniquement au mois actuellement affiché.
   */
  private updateSortiesForMonth() {
    this.sortiesDuMois = this.allSorties
      .filter((s: Sortie) => {
        const d = new Date(s.start);
        return (
          d.getMonth() === this.viewDate.getMonth() &&
          d.getFullYear() === this.viewDate.getFullYear()
        );
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
  }
}
