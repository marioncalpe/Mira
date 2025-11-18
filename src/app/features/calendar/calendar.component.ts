import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  imports: [MenuComponent]
})
export class CalendarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
