import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-motivation-banner',
  standalone: true,
  templateUrl: './motivation-banner.component.html',
  styleUrls: ['./motivation-banner.component.scss'],
})
export class MotivationBannerComponent implements OnInit {
  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  // Message affiché dans la bannière, tiré aléatoirement
  message = '';

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  // Au chargement, on choisit une citation aléatoire
  ngOnInit(): void {
    const index = Math.floor(Math.random() * this.quotes.length);
    this.message = this.quotes[index];
  }

  /*================================*/
  /*           CITATIONS            */
  /*================================*/

  quotes: string[] = [
    'Chaque petit pas te rapproche de ton objectif.',
    'Tu es plus capable que tu ne le crois.',
    "Aujourd'hui est une nouvelle chance de briller.",
    "Continue, même quand c'est difficile — surtout quand c'est difficile.",
    "Tu mérites le meilleur, n'en doute jamais.",
    'Respire, recentre-toi, avance.',
    'Les progrès prennent du temps — sois fière de chaque étape.',
    "Tu n'es pas seule, tu es entourée et soutenue.",
    'Le changement commence par un simple geste.',
    "Tu as déjà surmonté tellement d'épreuves.",
    'Tu es forte, même dans le doute.',
    'Prends soin de toi — tu en vaux chaque instant.',
    "Avance à ton rythme, c'est le seul qui compte.",
    'Chaque effort compte, même les plus discrets.',
    'Tu as le pouvoir de créer la vie que tu désires.',
    "L'important n'est pas la vitesse, mais la direction.",
    "Tu progresses déjà, même sans t'en rendre compte.",
    'Garde confiance, tu es exactement là où il faut.',
    "Une pause n'est pas un échec, c'est une respiration.",
    'Crois en toi, un peu plus chaque jour.',
    "Tu as le droit de recommencer autant de fois qu'il le faut.",
    "Ton bien-être n'est pas un luxe, c'est une priorité.",
    'Chaque journée traversée est une victoire.',
    'Tu peux transformer ta vie, un geste à la fois.',
    "Tu es capable de choses bien plus grandes que tu ne l'imagines.",
    'Sois douce avec toi-même — tu fais de ton mieux.',
    'Rappelle-toi pourquoi tu as commencé.',
    "Le courage, c'est continuer malgré les doutes.",
    "Tout ce qu'il te faut est déjà en toi.",
    "Aujourd'hui, tu choisis de prendre soin de toi.",
  ];
}
