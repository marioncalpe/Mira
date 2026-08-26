import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HomeComponent } from './features/home/home.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
    providers: [
      importProvidersFrom(
        CalendarModule.forRoot({
          provide: DateAdapter,
          useFactory: adapterFactory,
        }),
      ),
    ],
  },
  {
    path: 'achivements',
    loadComponent: () => import('./features/Achivements/Achivements.component').then(m => m.AchivementsComponent)
  },
  {
    path: 'progress',
    loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'coherence',
    loadComponent: () => import('./features/coherence/coherence.component').then(m => m.CoherenceComponent)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
  },
  {
    path: 'apropos',
    loadComponent: () => import('./features/apropos/apropos.component').then(m => m.AproposComponent)
  },
];