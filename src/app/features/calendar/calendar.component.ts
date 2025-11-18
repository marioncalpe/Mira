// src/app/features/calendar/calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [FullCalendarModule, MenuComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [] as EventInput[], // Typage explicite
    editable: true,
    selectable: true,
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
  };

  ngOnInit(): void {
    // Charger les événements depuis localStorage
    const savedEvents = localStorage.getItem('sorties');
    if (savedEvents) {
      this.calendarOptions.events = JSON.parse(savedEvents) as EventInput[];
    }
  }

  handleDateClick(arg: { dateStr: string }) {
    const title = prompt('Nom de la sortie :');
    if (title) {
      // Ajouter le nouvel événement au tableau existant
      const newEvent: EventInput = {
        title: title,
        start: arg.dateStr,
      };
      this.calendarOptions.events = [...(this.calendarOptions.events as EventInput[]), newEvent];
      // Sauvegarder dans localStorage
      localStorage.setItem('sorties', JSON.stringify(this.calendarOptions.events));
    }
  }

  handleEventClick(arg: { event: { title: string } }) {
    alert(`Sortie : ${arg.event.title}`);
  }
}
