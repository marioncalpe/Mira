import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CalendarComponent } from './features/calendar/calendar.component';
import { AchivementsComponent } from './features/Achivements/Achivements.component';
import { ProgressComponent } from './features/progress/progress.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home', // Redirige vers la page d'accueil par défaut
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'calendar',
    component: CalendarComponent
  },
  {
    path: 'achivements',
    component: AchivementsComponent
  },
  {
    path: 'progress',
    component: ProgressComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  }
];