import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';

@Component({
    selector: 'app-class',
    standalone: true,
    templateUrl: './class.component.html',
    styleUrls: ['./class.component.scss'],
    imports: [MenuComponent, MotivationBannerComponent]
})
export class ClassComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
