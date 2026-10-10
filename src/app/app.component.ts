import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { BadgeNotificationComponent } from './shared/components/badge-notification/badge-notification.component';
import { NotificationService } from './core/notification.service';
import { ThemeService } from './core/theme.service';
import { isStandalone, isIos, isInAppBrowser } from  './core/pwa-utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BadgeNotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Mira';

  constructor(
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private router: Router
  ) {
    // this.notificationService.programmerTout();
  }

  ngOnInit(): void {
    console.log('standalone:', isStandalone(), '| iOS:', isIos(), '| in-app:', isInAppBrowser());
    if (!localStorage.getItem('onboarding_done')) {
      this.router.navigate(['/onboarding']);
    }
  }
}