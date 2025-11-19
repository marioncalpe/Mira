import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [RouterLink, RouterLinkActive], // on mettra MenuComponent ici après
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
