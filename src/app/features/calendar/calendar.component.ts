// src/app/features/calendar/calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Sortie } from '../../core/sortie.model';
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
    events: [] as any[],
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
  };

  ngOnInit(): void {
    const savedEvents = localStorage.getItem('sorties');
    if (savedEvents) {
      this.calendarOptions.events = JSON.parse(savedEvents);
    }
  }

  handleDateClick(arg: { dateStr: string }) {
    const title = prompt('Nom de la sortie :');
    if (!title) return;

    let noteAvant: number | null = null;
    while (noteAvant === null || noteAvant < 1 || noteAvant > 10) {
      const input = prompt('Note avant la sortie (1 à 10) :');
      noteAvant = input ? parseInt(input, 10) : null;
      if (noteAvant === null || isNaN(noteAvant) || noteAvant < 1 || noteAvant > 10) {
        alert('Veuillez entrer un nombre entre 1 et 10.');
      }
    }

    const sentiment = prompt('Comment tu te sens avant cette sortie ?');
    const category = prompt('Catégorie (Cinéma/Sport/Restaurant) :');

    let color = '#6C63FF';
    if (category === 'Cinéma') color = '#6C63FF';
    if (category === 'Sport') color = '#4ECDC4';
    if (category === 'Restaurant') color = '#FF6584';

    const newSortie = {
      title: `${category}: ${title}`,
      start: arg.dateStr,
      backgroundColor: color,
      borderColor: color,
      textColor: '#FFFFFF',
      extendedProps: {
        noteAvant: noteAvant,
        sentiment: sentiment || '',
        category: category || '',
      },
    };

    this.calendarOptions.events = [newSortie];
    localStorage.setItem('sorties', JSON.stringify(this.calendarOptions.events));
  }

  handleEventClick(arg: EventClickArg) {
    const sortie = arg.event;
    const action = prompt(`
      Détails de la sortie:
      Titre: ${sortie.title}
      Date: ${sortie.start?.toString()}
      Note avant: ${sortie.extendedProps['noteAvant'] || 'Non renseignée'}
      Sentiment avant: ${sortie.extendedProps['sentiment'] || 'Non renseigné'}
      Note pendant: ${sortie.extendedProps['notePendant'] || 'Non renseignée'}
      Tape "update" pour ajouter une note après la sortie.
    `);

    if (action === 'update') {
      let notePendant: number | null = null;
      while (notePendant === null || notePendant < 1 || notePendant > 10) {
        const input = prompt('Note pendant/après la sortie (1 à 10) :');
        notePendant = input ? parseInt(input, 10) : null;
        if (notePendant === null || isNaN(notePendant) || notePendant < 1 || notePendant > 10) {
          alert('Veuillez entrer un nombre entre 1 et 10.');
        }
      }

      if (notePendant !== null) {
        sortie.setExtendedProp('notePendant', notePendant);
        localStorage.setItem('sorties', JSON.stringify(this.calendarOptions.events));
        alert('Note ajoutée avec succès !');
      }
    }
  }
}
