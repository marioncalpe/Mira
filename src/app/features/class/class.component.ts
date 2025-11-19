import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
    selector: 'app-class',
    templateUrl: './class.component.html',
    styleUrls: ['./class.component.scss'],
    imports: [MenuComponent]
})
export class ClassComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
