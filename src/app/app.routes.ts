import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MenuComponent } from './shared/components/menu/menu.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
];