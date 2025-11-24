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
import { SortieService } from '../../core/service/sortie.service';
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
      }
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
    MotivationBannerComponent
],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  modalVisible = false;
  selectedSortie: Sortie | null = null;
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  locale = 'fr';
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  weekendDays: number[] = [DAYS_OF_WEEK.FRIDAY, DAYS_OF_WEEK.SATURDAY];

  events: CalendarEvent[] = [];
  modalMode: 'view' | 'edit' | 'create' = 'view';
  private allSorties: Sortie[] = [];
  sortiesDuMois: Sortie[] = [];
  constructor(private sortieService: SortieService) {}

  async ngOnInit() {
    await this.refreshCalendar();
  }

  async refreshCalendar() {
    this.allSorties = await this.sortieService.getSorties();

    this.events = this.allSorties.map((sortie: Sortie) => ({
      id: sortie.id,
      title: sortie.title,
      start: new Date(sortie.start),
      meta: { ...sortie.extendedProps },
      color: this.getColorForSortie(sortie),
    }));

    this.updateSortiesForMonth();
  }

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

  onSave(sortie: Sortie) {
    if (sortie.id) {
      this.sortieService.updateSortie(sortie);
    } else {
      sortie.id = crypto.randomUUID();
      this.sortieService.addSortie(sortie);
    }

    this.refreshCalendar();
    this.modalVisible = false;
  }

  onDelete(sortie: Sortie) {
    this.sortieService.deleteSortie(sortie);
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
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );
  }
}
