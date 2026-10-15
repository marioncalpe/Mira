import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { BadgeNotificationComponent } from './shared/components/badge-notification/badge-notification.component';
import { InstallHintComponent } from './shared/components/install-hint/install-hint.component';
import { HeadComponent } from './shared/components/head/head.component';
import { MenuComponent } from './shared/components/menu/menu.component';
import { NotificationService } from './core/notification.service';
import { StorageService } from './core/storage/storage.service';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BadgeNotificationComponent,
    InstallHintComponent,
    HeadComponent,
    MenuComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Mira';

  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  prenom = '';

  // Données de la route actuelle (null = page pas encore migrée vers la coque)
  private titreBase: string | null = null;
  private ajouterPrenom = false;

  private subscription = new Subscription();

  /*================================*/
  /*         CONSTRUCTEUR           */
  /*================================*/

  constructor(
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private storageService: StorageService,
    private router: Router
  ) {
    // this.notificationService.programmerTout();
  }

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
    if (!localStorage.getItem('onboarding_done')) {
      this.router.navigate(['/onboarding']);
    }

    // À chaque fin de navigation, on relit les données de la route
    this.subscription.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => this.lireDonneesRoute()),
    );

    // Le prénom sert à l'en-tête de l'accueil
    this.subscription.add(
      this.storageService.prenom$.subscribe((prenom) => (this.prenom = prenom)),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /*================================*/
  /*       AFFICHAGE DU CADRE       */
  /*================================*/

  // La coque affiche l'en-tête et le menu seulement si la page est migrée
  get cadreActif(): boolean {
    return this.titreBase !== null;
  }

  // Titre affiché dans l'en-tête ("Bonjour Marion" pour l'accueil, "Succès"...)
  get titre(): string {
    if (this.titreBase === null) return '';
    return this.ajouterPrenom && this.prenom
      ? `${this.titreBase} ${this.prenom}`
      : this.titreBase;
  }

  // Les routes sont imbriquées : on descend jusqu'à la plus profonde (la page affichée)
  private lireDonneesRoute(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const donnees = route.data;
    this.titreBase = donnees['titre'] ?? null;
    this.ajouterPrenom = donnees['avecPrenom'] === true;
  }
}