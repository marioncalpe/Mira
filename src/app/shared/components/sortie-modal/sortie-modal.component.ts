import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sortie } from '../../../core/models/sortie.model';

@Component({
  selector: 'app-sortie-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sortie-modal.component.html',
  styleUrls: ['./sortie-modal.component.scss'],
})
export class SortieModalComponent implements OnChanges {
  /*================================*/
  /*            INPUTS              */
  /*  Données reçues du composant   */
  /*  parent (ex: calendar)         */
  /*================================*/

  @Input() visible = true;
  @Input() sortie: Sortie | null = null;
  @Input() mode: 'view' | 'edit' | 'create' = 'view';

  /*================================*/
  /*            OUTPUTS             */
  /*  Événements envoyés au parent  */
  /*================================*/

  @Output() save = new EventEmitter<Sortie>();
  @Output() delete = new EventEmitter<Sortie>();
  @Output() close = new EventEmitter<void>();
  @Output() modeChange = new EventEmitter<'view' | 'edit' | 'create'>();

  /*================================*/
  /*           VARIABLES            */
  /*================================*/

  // Copie temporaire de la sortie en cours d'édition
  // On travaille sur cette copie pour ne pas modifier l'original
  // tant que l'utilisateur n'a pas validé
  temp: Sortie = this.createEmptySortie();

  /*================================*/
  /*          CYCLE DE VIE          */
  /*================================*/

  // S'exécute à chaque fois qu'un @Input() change
  // On recharge temp avec la nouvelle sortie reçue
  ngOnChanges() {
    this.temp = this.sortie
      ? {
          ...this.sortie,
          extendedProps: { ...this.sortie.extendedProps },
        }
      : this.createEmptySortie();
  }

  /*================================*/
  /*            ACTIONS             */
  /*================================*/

  // Ouvre la modal en mode création
  // Si une sortie est fournie on la copie, sinon on part de zéro
  openCreate(sortie?: Sortie): void {
    this.modeChange.emit('edit');
    this.visible = true;
    this.temp = sortie
      ? { ...sortie, extendedProps: { ...sortie.extendedProps } }
      : this.createEmptySortie();
  }

  // Envoie la sortie modifiée au composant parent
  onSave(): void {
    this.save.emit(this.temp);
  }

  // Passe en mode édition depuis le mode vue
  switchToEdit(): void {
    this.modeChange.emit('edit');
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
  /*       MÉTHODES PRIVÉES         */
  /*================================*/

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
}
