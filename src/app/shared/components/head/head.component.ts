import { Component, OnInit, Input } from '@angular/core';
import { MotivationBannerComponent } from "../motivation-banner/motivation-banner.component";

@Component({
  selector: 'app-head',
  templateUrl: './head.component.html',
  styleUrls: ['./head.component.scss'],
  imports: [MotivationBannerComponent]
})
export class HeadComponent implements OnInit {
  @Input() h1: string = '';

  constructor() { }

  ngOnInit() {
  }

}
