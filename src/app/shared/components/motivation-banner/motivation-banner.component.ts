import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-motivation-banner',
  standalone: true,
  templateUrl: './motivation-banner.component.html',
  styleUrls: ['./motivation-banner.component.scss']
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
    "Chaque petit pas te rapproche de ton objectif.",
    "Tu es plus capable que tu ne le penses.",
    "Aujourd'hui est une nouvelle chance de réussir.",
    "Continue, même quand c'est difficile.",
    "Tu mérites le meilleur, ne l'oublie jamais.",
    "Respire, recentre-toi, avance.",
    "Les progrès prennent du temps — sois fière de chaque étape.",
    "Tu n'es pas seule, tu es soutenue.",
    "Le changement commence par un simple geste.",
    "Tu as déjà surmonté tellement de choses.",
    "Tu es forte, même quand tu doutes.",
    "Prends soin de toi, tu en vaux la peine.",
    "Avance à ton rythme, c'est le bon.",
    "Chaque effort compte, même les plus petits.",
    "Tu peux créer la vie que tu veux.",
    "L'important n'est pas la vitesse, mais la direction.",
    "Tu progresses déjà, même si tu ne le vois pas.",
    "Garde confiance, tu es sur le bon chemin.",
    "Une pause n'est pas un échec.",
    "Crois en toi, un peu plus chaque jour.",
    "Tu as le droit de recommencer autant de fois que nécessaire.",
    "Ton bien-être est une priorité.",
    "Chaque journée est une victoire.",
    "Tu peux transformer ta routine, un geste à la fois.",
    "Tu es capable de belles choses.",
    "Sois gentille avec toi-même, tu fais de ton mieux.",
    "Rappelle-toi pourquoi tu as commencé.",
    "Le courage, c'est continuer malgré les doutes.",
    "Tu as tout en toi pour réussir.",
    "Aujourd'hui, tu choisis de te faire du bien."
  ];
}