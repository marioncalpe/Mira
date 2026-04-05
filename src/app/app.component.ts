import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BadgeNotificationComponent } from './shared/components/badge-notification/badge-notification.component';
import { NotificationService } from './core/notification.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BadgeNotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Mira';

  constructor(private notificationService: NotificationService, private themeService: ThemeService ) {
    this.notificationService.programmerTout();
    
  }

  async ngOnInit() {}
}