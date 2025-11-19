import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    imports: [MenuComponent]
})
export class SettingsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
