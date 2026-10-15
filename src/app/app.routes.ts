import { Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HomeComponent } from './features/home/home.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// "data" : des informations attachées à une route, lisibles par la coque.
//  - titre      : le titre affiché dans l'en-tête (absent = pas d'en-tête ni de menu)
//  - avecPrenom : ajoute le prénom après le titre (accueil)
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    data: { titre: 'Bonjour', avecPrenom: true },
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
    data: { titre: 'Calendrier' },
  },
  {
    path: 'achivements',
    loadComponent: () => import('./features/achivements/achivements.component').then(m => m.AchivementsComponent),
    data: { titre: 'Succès' },
  },
  {
    path: 'progress',
    loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent),
    data: { titre: 'Mon progrès' },
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    data: { titre: 'Paramètres' },
  },
  {
    path: 'coherence',
    loadComponent: () => import('./features/coherence/coherence.component').then(m => m.CoherenceComponent),
    data: { titre: 'SOS' },
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent)
    // pas de "titre" : la coque n'affiche ni en-tête ni menu
  },
  {
    path: 'apropos',
    loadComponent: () => import('./features/apropos/apropos.component').then(m => m.AproposComponent),
    data: { titre: 'À propos' },
  },
];