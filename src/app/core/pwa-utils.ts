/*================================*/
/*          PWA UTILS             */
/*  Petites fonctions qui         */
/*  répondent à des questions     */
/*  sur l'appareil et le mode     */
/*  d'ouverture de l'appli        */
/*================================*/

// On dit à TypeScript que "navigator" peut avoir une propriété "standalone".
// Elle existe seulement sur Safari iOS, donc elle n'est pas dans les types
// par défaut. Le "?" veut dire "optionnelle" : elle peut être absente.
type NavigatorIos = Navigator & { standalone?: boolean };

// L'appli est-elle ouverte depuis l'écran d'accueil (donc installée) ?
export function isStandalone(): boolean {
  // Test standard, valable sur Android et iOS récents
  const modeStandalone = window.matchMedia('(display-mode: standalone)').matches;

  // Test spécifique à Safari iOS (ancienne méthode)
  const standaloneIos = (navigator as NavigatorIos).standalone === true;

  // Il suffit qu'un des deux soit vrai
  return modeStandalone || standaloneIos;
}

// L'appareil est-il un iPhone, un iPad ou un iPod ?
export function isIos(): boolean {
  // Cas classique : le texte du navigateur contient le nom de l'appareil
  const ua = navigator.userAgent;
  const iosClassique = /iPhone|iPad|iPod/i.test(ua);

  // Cas des iPad récents : ils se présentent comme un Mac,
  // mais un Mac n'a pas d'écran tactile (donc maxTouchPoints > 1 = iPad)
  const ipadRecent = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return iosClassique || ipadRecent;
}

// Le site est-il ouvert dans le navigateur intégré d'une autre appli ?
// (Instagram, Facebook, Messenger, TikTok, Snapchat, LinkedIn...)
export function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Messenger|TikTok|musical_ly|Snapchat|LinkedInApp/i.test(ua);
}