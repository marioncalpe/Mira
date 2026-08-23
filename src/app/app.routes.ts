import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { CalendarComponent } from './features/calendar/calendar.component';
import { AchivementsComponent } from './features/Achivements/Achivements.component';
import { ProgressComponent } from './features/progress/progress.component';
import { SettingsComponent } from './features/settings/settings.component';
import { CoherenceComponent } from './features/coherence/coherence.component';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { AproposComponent } from './features/apropos/apropos.component';

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
  ,
  {
    path: 'coherence',
    component: CoherenceComponent
  },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'apropos', component: AproposComponent },
];