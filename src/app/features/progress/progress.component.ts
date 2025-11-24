import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';

@Component({
    selector: 'app-progress',
    standalone: true,
    templateUrl: './progress.component.html',
    styleUrls: ['./progress.component.scss'],
    imports: [MenuComponent, MotivationBannerComponent]
})
export class ProgressComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
