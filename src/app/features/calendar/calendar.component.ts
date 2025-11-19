import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SortieService } from '../../core/service/sortie.service';
import { Sortie } from '../../core/models/sortie.model';
import { SortieModalComponent } from '../../shared/components/sortie-modal/sortie-modal.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, SortieModalComponent, MenuComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {

  modalVisible = false;
  selectedSortie: Sortie | null = null;

  calendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [] as Sortie[],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(private sortieService: SortieService) {}

  ngOnInit() {
    this.refreshCalendar();
  }

  refreshCalendar() {
    this.calendarOptions.events = this.sortieService.getSorties();
  }

  handleDateClick(info: any) {
    this.selectedSortie = {
      title: '',
      start: info.dateStr,
      extendedProps: {}
    };
    this.modalVisible = true;
  }

  handleEventClick(info: any) {
    this.selectedSortie = {
      title: info.event.title,
      start: info.event.startStr,
      extendedProps: { ...info.event.extendedProps }
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
