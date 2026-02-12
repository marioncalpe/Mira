import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';

@Component({
  selector: 'app-Achivements',
  standalone: true,
  templateUrl: './Achivements.component.html',
  styleUrls: ['./Achivements.component.scss'],
  imports: [CommonModule, MenuComponent, MotivationBannerComponent],
})
export class AchivementsComponent implements OnInit {
  trophies = [
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1PremiereSortie.png',
      title: 'Première Sortie',
      description: 'Tu viens de commencer ton aventure !',
      unlocked: true,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1EnMouvement.png',
      title: 'En mouvement',
      description: 'Tu as fait 5 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1MiraActive.png',
      title: 'Mira Active',
      description: 'Tu as fait 10 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1Exploratrice.png',
      title: 'Exploratrice',
      description: 'Tu as fait 20 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1Aventurier.png',
      title: 'Aventurier',
      description: 'Tu as fait 30 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1Nomade.png',
      title: 'Nomade',
      description: 'Tu as fait 50 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1ToujoursDehors.png',
      title: 'Toujours dehors',
      description: 'Tu as fait 75 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1Maratonien.png',
      title: 'Maratonien',
      description: 'Tu as fait 100 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1Inarretable.png',
      title: 'Inarrêtable',
      description: 'Tu as fait 150 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/1-NombresDeSorties/1LegendesSortie.png',
      title: 'Légende de la Sortie',
      description: 'Tu as fait 200 sorties !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2RayonDeSoleil.png',
      title: 'Rayon de Soleil',
      description: 'Tu as fait 5 sorties notées "Tres bien" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2EnergiePositive.png',
      title: 'Energie Positive',
      description: 'Tu as fait 15 sorties notées "Tres bien" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2HumeurEnOr.png',
      title: 'Humeur en Or',
      description: 'Tu as fait 30 sorties notées "Tres bien" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2BonneVibes.png',
      title: 'Bonne Vibes',
      description: 'Tu as fait 5 sorties notées "Bien" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2Optimiste.png',
      title: 'Optimiste',
      description: 'Tu as fait 10 sorties notées "Bien" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2StableEtSereine.png',
      title: 'Stable et Sereine',
      description: 'Tu as fait 25 sorties notées "Bien" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2CavaAller.png',
      title: 'Ca va Aller',
      description: 'Tu as fait 5 sorties notées "Moyen" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2TuTiensLeCap.png',
      title: 'Tu tiens le Cap',
      description: 'Tu as fait 15 sorties notées "Moyen" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2Ressilient.png',
      title: 'Ressilient',
      description: 'Tu as fait 30 sorties notées "Moyen" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2SortieCourageuse.png',
      title: 'Sortie Courageuse',
      description: 'Tu as fait 1 sorties notées "Tendu" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2TuNeLachesRien.png',
      title: 'Tu ne lâches rien',
      description: 'Tu as fait 5 sorties notées "Tendu" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/2-Humeurs/2courageQuotidien.png',
      title: 'Courage Quotidien',
      description: 'Tu as fait 10 sorties notées "Tendu" !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/3-Progression/3PetitMieux.png',
      title: 'Petit Mieux',
      description: 'une sortie avec une humeur meilleure que la précédente',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/3-Progression/3Tuprograsse.png',
      title: 'Tu progresses',
      description: "Tu as fait 5 sorties avec une amélioration d'humeur !",
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/3-Progression/3BonneDynamique.png',
      title: 'Bonne Dynamique',
      description: "Tu as fait 10 sorties avec une amélioration d'humeur !",
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/3-Progression/3AscensionPositive.png',
      title: 'Ascension Positive',
      description: "Tu as fait 20 sorties avec une amélioration d'humeur !",
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/3-Progression/3RevenirplusFort.png',
      title: 'Revenir plus Fort',
      description:
        'Tu as fait 1 sortie avec une humeur améliorée après un jour difficile !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/3-Progression/3Resilience.png',
      title: 'Résilience',
      description: ' 3 sorties consécutives après une période tendue',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/3-Progression/3Transformation.png',
      title: 'Transformation',
      description: 'Amélioration visible sur un mois',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/4-Repetitions/4JoursDaffilee.png',
      title: "2 Jours d'affilée",
      description: 'Tu as fait 2 sorties consécutives !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/4-Repetitions/4ToujoursPresent.png',
      title: 'Toujours présent',
      description: 'Tu as fait 3 sorties consécutives !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/4-Repetitions/4RythmeTrouve.png',
      title: 'Rythme Trouvé',
      description: 'Tu as fait 7 sorties consécutives !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/4-Repetitions/4RoutineSolide.png',
      title: 'Routine Solide',
      description: 'Tu as fait 14 sorties consécutives !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/4-Repetitions/4FlowParfait.png',
      title: 'Flow Parfait',
      description: 'Tu as fait 21 sorties consécutives !',
      unlocked: false,
    },
    {
      image: 'assets/icons/achivements/4-Repetitions/4Constance.png',
      title: 'Constance',
      description: 'Tu as fait 30 sorties consécutives !',
      unlocked: false,
    },
  ];

  constructor() {}

  ngOnInit() {}
  selectedTrophy: any = null;

  openTrophy(trophy: any) {
    this.selectedTrophy = trophy;
  }

  closeModal() {
    this.selectedTrophy = null;
  }
}
