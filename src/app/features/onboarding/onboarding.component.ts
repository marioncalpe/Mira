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
      texte:
        'Ton espace personnel pour suivre tes sorties et progresser à ton rythme.',
    },
    {
      titre: "Tes stats en un coup d'œil 📊",
      texte:
        'Sorties du mois, objectifs en cours et ton record de jours consécutifs.',
    },
    {
      titre: "Besoin d'aide immédiate ? 🆘",
      texte:
        "Le bouton SOS te donne des conseils anti-crise et l'exercice de cohérence cardiaque.",
    },
    {
      titre: 'Tes sorties récentes 🚶',
      texte: "Retrouve en un clin d'œil tes dernières sorties enregistrées.",
    },
    {
      titre: 'Note ce qui compte 📝',
      texte: 'Garde une trace des sujets à aborder avec ta psy, à ton rythme.',
    },
    {
      titre: 'Ton calendrier de sorties 📅',
      texte:
        "Clique sur un jour pour ajouter une sortie. Le bouton + du menu permet aussi d'en ajouter une rapidement !",
    },
    {
      titre: 'Suis ta progression 📈',
      texte:
        'Tes notes moyennes avant/après et ton graphique de sorties par mois.',
    },
    {
      titre: 'Fixe-toi des objectifs 🎯',
      texte:
        'Crée des petits défis du quotidien et coche-les au fur et à mesure.',
    },
    {
      titre: 'Débloque des succès 🏆',
      texte:
        'Plus tu sors, plus tu débloques de badges. Chaque effort est récompensé.',
    },
    {
      titre: 'Tu es prête ! 🌸',
      texte:
        'Renseigne ton prénom si tu veux, personnalise ton thème, sauvegarde tes données et retrouve toutes les infos dans "À propos".',
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

  precedent(): void {
    if (this.slideActuel > 0) {
      this.slideActuel--;
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

  get estPremier(): boolean {
    return this.slideActuel === 0;
  }
}
