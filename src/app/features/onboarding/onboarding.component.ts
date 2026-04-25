import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Slide {
  titre: string;
  texte: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {

  slideActuel = 0;

  slides: Slide[] = [
    {
      titre: 'Bienvenue sur Mira 🌸',
      texte: 'Ton espace personnel pour suivre tes sorties et progresser à ton rythme.'
    },
    {
      titre: 'Ton calendrier de sorties 📅',
      texte: 'Clique sur un jour pour ajouter une sortie. Le bouton + en bas te permet d\'en ajouter une rapidement !'
    },
    {
      titre: 'Suis ta progression 📊',
      texte: 'Visualise tes stats, tes notes moyennes, ton graphique mensuel et tes objectifs personnels.'
    },
    {
      titre: 'Débloque des succès 🏆',
      texte: 'Plus tu sors, plus tu débloque des badges ! Chaque effort est récompensé.'
    },
    {
      titre: 'Tu es prête ! 🌸',
      texte: 'Sauvegarde tes données régulièrement et personnalise ton thème. Chaque petit pas compte, on est fière de toi !'
    },
  ];

  constructor(private router: Router) {}

  suivant(): void {
    if (this.slideActuel < this.slides.length - 1) {
      this.slideActuel++;
    } else {
      this.terminer();
    }
  }

  passer(): void {
    this.terminer();
  }

  private terminer(): void {
    localStorage.setItem('onboarding_done', 'true');
    this.router.navigate(['/home']);
  }

  get estDernier(): boolean {
    return this.slideActuel === this.slides.length - 1;
  }
}