import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sortie } from '../../../core/models/sortie.model';
import {
  nettoyerTitres,
  titreDepuisListe,
  titresDeLaSortie,
} from '../../../core/sorties-utils';

@Component({
  selector: 'app-sortie-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sortie-modal.component.html',
  styleUrls: ['./sortie-modal.component.scss'],
})
export class SortieModalComponent implements OnChanges, AfterViewInit {
  /*================================*/
  /*            INPUTS              */
  /*  Données reçues du composant   */
  /*  parent (ex: calendar)         */
  /*================================*/

  @Input() visible = true;
  @Input() sortie: Sortie | null = null;
  @Input() mode: 'view' | 'edit' | 'suppr' | 'create' = 'view';

  /*================================*/
  /*            OUTPUTS             */
  /*  Événements envoyés au parent  */
  /*================================*/

  @Output() save = new EventEmitter<Sortie>();
  @Output() delete = new EventEmitter<Sortie>();
  @Output() close = new EventEmitter<void>();
  @Output() modeChange = new EventEmitter<'view' | 'edit' | 'suppr' | 'create'>();

  // Les champs "titre" affichés en modification (pour pouvoir donner le focus)
  @ViewChildren('champTitre') champsTitre!: QueryList<ElementRef<HTMLInputElement>>;

  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  // Copie temporaire de la sortie en cours d'édition
  // On travaille sur cette copie pour ne pas modifier l'original
  // tant que l'utilisateur n'a pas validé
  temp: Sortie = this.createEmptySortie();

  // Les sorties de la journée, une par ligne de saisie.
  // Toujours au moins une ligne (éventuellement vide).
  titres: string[] = [''];

  // Pour afficher les 5 étoiles avec une boucle
  etoiles = [1, 2, 3, 4, 5];

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  // S'exécute à chaque fois qu'un @Input() change.
  // On ne refait la copie que si c'est la SORTIE qui a changé : sinon, passer
  // de "consultation" à "modification" effacerait ce qu'on vient de préparer.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sortie']) {
      this.charger(this.sortie);
    }
  }

  // Si la fenêtre s'ouvre en modification avec une ligne vide en dernier
  // (bouton + du menu alors qu'une entrée existe déjà), on y place le curseur.
  ngAfterViewInit(): void {
    const derniere = this.titres[this.titres.length - 1];
    if (this.mode === 'edit' && this.titres.length > 1 && derniere === '') {
      this.focusDerniereLigne();
    }
  }

  /*================================*/
  /*            ACTIONS             */
  /*================================*/

  // Ouvre la modal en mode création
  // Si une sortie est fournie on la copie, sinon on part de zéro
  openCreate(sortie?: Sortie): void {
    this.modeChange.emit('edit');
    this.visible = true;
    this.charger(sortie ?? null);
  }

  // Envoie la sortie modifiée au composant parent
  onSave(): void {
    const titres = nettoyerTitres(this.titres); // sans lignes vides
    this.save.emit({
      ...this.temp,
      titres,
      title: titreDepuisListe(titres), // le texte de la journée, titres joints
    });
  }

  // Passe en mode édition depuis le mode vue
  switchToEdit(): void {
    this.modeChange.emit('edit');
  }

  // Depuis la consultation : ajoute une ligne vide et passe en modification
  ajouterDepuisLaVue(): void {
    if (this.titres[this.titres.length - 1] !== '') {
      this.titres.push('');
    }
    this.modeChange.emit('edit');
    this.focusDerniereLigne();
  }

  // Envoie la sortie originale au parent pour suppression
  onDelete(): void {
    if (this.sortie) {
      this.delete.emit(this.sortie);
    }
  }

  // Ferme la modal sans sauvegarder
  onClose(): void {
    this.close.emit();
  }

  /*================================*/
  /*    LIGNES DE TITRES (édition)  */
  /*================================*/

  ajouterTitre(): void {
    this.titres.push('');
    this.focusDerniereLigne();
  }

  // On garde toujours au moins une ligne : si c'est la dernière, on la vide
  retirerTitre(index: number): void {
    if (this.titres.length > 1) {
      this.titres.splice(index, 1);
    } else {
      this.titres[0] = '';
    }
  }

  // Touche "Entrée" dans un champ : on passe à la ligne suivante (créée si besoin)
  surEntree(event: Event, index: number): void {
    event.preventDefault();
    if (this.titres[index].trim() === '') return; // pas de lignes vides en série

    if (index === this.titres.length - 1) {
      this.ajouterTitre();
    } else {
      this.champsTitre.get(index + 1)?.nativeElement.focus();
    }
  }

  /*================================*/
  /*       POUR LE TEMPLATE         */
  /*================================*/

  // Les titres à afficher en consultation (sans lignes vides)
  get titresAffiches(): string[] {
    return this.sortie ? nettoyerTitres(titresDeLaSortie(this.sortie)) : [];
  }

  // Retourne true si la note est >= au seuil
  isNoteAvant(seuil: number): boolean {
    return (this.temp.extendedProps?.noteAvant ?? 0) >= seuil;
  }

  isNoteApres(seuil: number): boolean {
    return (this.temp.extendedProps?.noteApres ?? 0) >= seuil;
  }

  isNoteAvantView(seuil: number): boolean {
    return (this.sortie?.extendedProps?.noteAvant ?? 0) >= seuil;
  }

  isNoteApresView(seuil: number): boolean {
    return (this.sortie?.extendedProps?.noteApres ?? 0) >= seuil;
  }

  getCategoryEmoji(): string {
    switch (this.sortie?.extendedProps?.category) {
      case 'tresbien':
        return '😊';
      case 'bien':
        return '🙂';
      case 'moyen':
        return '😐';
      case 'anxieuse':
        return '😰';
      default:
        return '';
    }
  }

  /*================================*/
  /*       MÉTHODES PRIVÉES         */
  /*================================*/

  // Prépare la copie de travail et les lignes de titres à partir d'une sortie
  private charger(sortie: Sortie | null): void {
    if (sortie) {
      const titres = titresDeLaSortie(sortie);
      this.temp = { ...sortie, extendedProps: { ...sortie.extendedProps } };
      this.titres = titres.length > 0 ? [...titres] : [''];
    } else {
      this.temp = this.createEmptySortie();
      this.titres = [''];
    }
  }

  // Donne le curseur à la dernière ligne. setTimeout : on attend qu'Angular ait
  // fini d'afficher la nouvelle ligne avant de chercher son champ.
  private focusDerniereLigne(): void {
    setTimeout(() => this.champsTitre.last?.nativeElement.focus());
  }

  // Retourne une sortie vide avec des valeurs par défaut
  // Utilisée à l'initialisation et à la création
  private createEmptySortie(): Sortie {
    return {
      id: '',
      title: '',
      start: new Date().toISOString(),
      extendedProps: {
        category: '',
        noteAvant: 0,
        noteApres: 0,
        sentiment: '',
      },
    };
  }
}