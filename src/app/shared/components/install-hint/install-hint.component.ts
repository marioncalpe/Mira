import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  isAndroid,
  isInAppBrowser,
  isIos,
  isMobile,
  isStandalone,
} from '../../../core/pwa-utils';

/*================================*/
/*            TYPES               */
/*================================*/

// Le navigateur envoie cet événement, mais TypeScript ne le connaît pas :
// on décrit nous-mêmes ce dont on a besoin (prompt + userChoice).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Les 4 messages possibles. null = on n'affiche rien.
//  - 'ios-manuel'    : iPhone/iPad (Safari, Chrome, Firefox...) → étapes à la main
//  - 'android-manuel': Android sans bouton d'installation → étapes à la main
//  - 'installable'   : le navigateur propose l'installation → bouton "Installer"
//  - 'in-app'        : navigateur intégré (Instagram...) → "ouvre dans ton navigateur"
type ModeAffichage = 'ios-manuel' | 'android-manuel' | 'installable' | 'in-app' | null;

// Clé du localStorage : l'utilisateur a fermé le message
const CLE_FERME = 'install_hint_dismissed';

// Temps pendant lequel on attend l'événement d'installation sur Android
const DELAI_ATTENTE_ANDROID_MS = 3000;

@Component({
  selector: 'app-install-hint',
  standalone: true,
  templateUrl: './install-hint.component.html',
  styleUrls: ['./install-hint.component.scss'],
})
export class InstallHintComponent implements OnInit, OnDestroy {
  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  mode: ModeAffichage = null;
  visible = false;

  // L'événement du navigateur, gardé de côté pour l'utiliser au clic
  private promptEvent: BeforeInstallPromptEvent | null = null;

  // Le minuteur d'attente (Android), gardé pour pouvoir l'annuler
  private minuteur: ReturnType<typeof setTimeout> | null = null;

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  ngOnInit(): void {
    this.mode = this.detecterMode();
    this.mettreAJourVisibilite();

    // Android : le navigateur peut envoyer l'événement d'installation
    // un peu après le chargement. On l'attend quelques secondes ;
    // s'il n'est pas venu, on affiche les étapes manuelles.
    if (this.mode === null && isAndroid()) {
      this.minuteur = setTimeout(() => {
        if (this.mode === null) {
          this.mode = 'android-manuel';
          this.mettreAJourVisibilite();
        }
      }, DELAI_ATTENTE_ANDROID_MS);
    }
  }

  ngOnDestroy(): void {
    this.annulerAttente();
  }

  /*================================*/
  /*     ÉVÉNEMENT DU NAVIGATEUR    */
  /*================================*/

  // Chrome/Edge/Samsung Internet préviennent quand l'appli est installable.
  // @HostListener = "écoute cet événement de la fenêtre" (retiré tout seul à la destruction)
  @HostListener('window:beforeinstallprompt', ['$event'])
  surInstallationDisponible(event: Event): void {
    // Sur ordinateur, on laisse le navigateur faire : pas de fenêtre chez nous
    if (!isMobile()) return;

    event.preventDefault(); // on bloque la mini-bannière du navigateur
    this.promptEvent = event as BeforeInstallPromptEvent;
    this.annulerAttente();
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

  // Quel message afficher au démarrage ?
  // (Android : on ne sait pas encore, on attend l'événement → null)
  private detecterMode(): ModeAffichage {
    if (!isMobile()) return null;
    if (isInAppBrowser()) return 'in-app';
    if (isIos()) return 'ios-manuel';
    return null;
  }

  // Les conditions pour afficher le message, au même endroit :
  // un message à montrer, pas déjà fermé, appli pas déjà installée.
  private mettreAJourVisibilite(): void {
    const dejaFerme = this.lire(CLE_FERME) === 'true';
    this.visible = this.mode !== null && !dejaFerme && !isStandalone();
  }

  // Arrête le minuteur d'attente s'il tourne
  private annulerAttente(): void {
    if (this.minuteur !== null) {
      clearTimeout(this.minuteur);
      this.minuteur = null;
    }
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