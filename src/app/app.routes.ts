import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: '', // chemin vide = page principale
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: '**', // fallback pour toutes les autres routes non définies
    redirectTo: '' // redirige vers home
  }
];
