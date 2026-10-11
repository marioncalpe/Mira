import { Component, HostListener, OnInit } from '@angular/core';
import { isInAppBrowser, isIos, isStandalone } from '../../../core/pwa-utils';

/*================================*/
/*            TYPES               */
/*================================*/

// Le navigateur envoie cet événement, mais TypeScript ne le connaît pas :
// on décrit nous-mêmes ce dont on a besoin (prompt + userChoice).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Les 3 messages possibles. null = on n'affiche rien.
//  - 'ios'        : iPhone/iPad dans Safari → explications à la main
//  - 'ios-in-app' : iPhone dans Instagram, Facebook... → "ouvre dans Safari"
//  - 'installable': le navigateur propose l'installation → bouton "Installer"
type ModeAffichage = 'ios' | 'ios-in-app' | 'installable' | null;

// Clé du localStorage : l'utilisatrice a fermé le message
const CLE_FERME = 'install_hint_dismissed';

@Component({
  selector: 'app-install-hint',
  standalone: true,
  templateUrl: './install-hint.component.html',
  styleUrls: ['./install-hint.component.scss'],
})
export class InstallHintComponent implements OnInit {
  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  mode: ModeAffichage = null;
  visible = false;

  // L'événement du navigateur, gardé de côté pour l'utiliser au clic
  private promptEvent: BeforeInstallPromptEvent | null = null;

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
    this.mode = this.detecterMode();
    this.mettreAJourVisibilite();
  }

  /*================================*/
  /*     ÉVÉNEMENT DU NAVIGATEUR    */
  /*================================*/

  // Chrome/Edge (Android et ordinateur) préviennent quand l'appli est installable.
  // @HostListener = "écoute cet événement de la fenêtre" (retiré tout seul à la destruction)
  @HostListener('window:beforeinstallprompt', ['$event'])
  surInstallationDisponible(event: Event): void {
    event.preventDefault(); // on bloque la mini-bannière du navigateur
    this.promptEvent = event as BeforeInstallPromptEvent;
    this.mode = 'installable';
    this.mettreAJourVisibilite();
  }

  /*================================*/
  /*            ACTIONS             */
  /*================================*/

  // Clic sur "Installer" : on déclenche la vraie fenêtre d'installation
  async installer(): Promise<void> {
    if (!this.promptEvent) return;

    await this.promptEvent.prompt();
    await this.promptEvent.userChoice;

    // Un événement ne sert qu'une seule fois : on le jette
    this.promptEvent = null;
    this.visible = false;
  }

  // Clic sur la croix, le voile ou un bouton : on retient le choix
  // pour ne plus afficher le message
  fermer(): void {
    this.ecrire(CLE_FERME, 'true');
    this.visible = false;
  }

  /*================================*/
  /*       MÉTHODES PRIVÉES         */
  /*================================*/

  // Quel message afficher au démarrage ? (Android/ordinateur : on attend l'événement)
  private detecterMode(): ModeAffichage {
    if (!isIos()) return null;
    return isInAppBrowser() ? 'ios-in-app' : 'ios';
  }

  // Les conditions pour afficher le message, au même endroit :
  // un message à montrer, pas déjà fermé, appli pas déjà installée.
  private mettreAJourVisibilite(): void {
    const dejaFerme = this.lire(CLE_FERME) === 'true';
    this.visible = this.mode !== null && !dejaFerme && !isStandalone();
  }

  // localStorage peut lancer une erreur (cookies bloqués) : on protège
  private lire(cle: string): string | null {
    try {
      return localStorage.getItem(cle);
    } catch {
      return null;
    }
  }

  private ecrire(cle: string, valeur: string): void {
    try {
      localStorage.setItem(cle, valeur);
    } catch {
      // stockage bloqué : tant pis, le message pourra réapparaître
    }
  }
}