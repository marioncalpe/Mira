import { Component, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { CalendarMonthViewComponent } from 'angular-calendar';
import { SortieService } from '../../core/service/sortie.service';
import { Sortie } from '../../core/models/sortie.model';
import { SortieModalComponent } from '../../shared/components/sortie-modal/sortie-modal.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    SortieModalComponent,
    MenuComponent,
    CalendarMonthViewComponent, // Ajoute ce module
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  modalVisible = false;
  selectedSortie: Sortie | null = null;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  constructor(private sortieService: SortieService) {}

  ngOnInit() {
    this.refreshCalendar();
  }

  refreshCalendar() {
    const sorties = this.sortieService.getSorties();
    this.events = sorties.map((sortie) => ({
      title: sortie.title,
      start: new Date(sortie.start),
      meta: sortie.extendedProps,
      color: this.getColorForSortie(sortie),
    }));
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
    this.selectedSortie = {
      title: '',
      start: date.toISOString(),
      extendedProps: {},
    };
    this.modalVisible = true;
  }

  handleEventClick(event: CalendarEvent) {
    this.selectedSortie = {
      title: event.title,
      start: event.start.toISOString(),
      extendedProps: { ...event.meta },
    };
    this.modalVisible = true;
  }

  onSave(sortie: Sortie) {
    if (this.selectedSortie?.title) {
      this.sortieService.updateSortie(sortie);
    } else {
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
}
