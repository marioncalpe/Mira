import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

/*================================*/
/*          THEME SERVICE         */
/*  Gère le thème de l'app        */
/*  light ou dark                 */
/*================================*/
@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  /*================================*/
  /*          CONSTRUCTEUR          */
  /*  Charge le thème sauvegardé    */
  /*  au démarrage                  */
  /*================================*/
  constructor() {
    const theme = localStorage.getItem('theme') as Theme ?? 'light';
    this.appliquerTheme(theme);
  }

  /*================================*/
  /*            MÉTHODES            */
  /*================================*/

  // Retourne le thème actuel
  getTheme(): Theme {
    return localStorage.getItem('theme') as Theme ?? 'light';
  }

  // Change le thème et le sauvegarde
  setTheme(theme: Theme): void {
    localStorage.setItem('theme', theme);
    this.appliquerTheme(theme);
  }

  // Bascule entre light et dark
  toggleTheme(): void {
    const actuel = this.getTheme();
    this.setTheme(actuel === 'light' ? 'dark' : 'light');
  }

  // Applique la classe sur le body
  private appliquerTheme(theme: Theme): void {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }
}