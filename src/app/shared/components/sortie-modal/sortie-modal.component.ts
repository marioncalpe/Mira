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
  @Input() visible = true;
  @Input() sortie: Sortie | null = null;

  @Input() mode: 'view' | 'edit' | 'create' = 'view';

  @Output() save = new EventEmitter<Sortie>();
  @Output() delete = new EventEmitter<Sortie>();
  @Output() close = new EventEmitter<void>();
  @Output() modeChange = new EventEmitter<'view' | 'edit' | 'create'>();

  temp: Sortie = this.createEmptySortie();

  ngOnChanges() {
    this.temp = this.sortie
      ? {
          ...this.sortie,
          extendedProps: { ...this.sortie.extendedProps },
        }
      : this.createEmptySortie();
  }

  openCreate(sortie?: Sortie) {
    this.modeChange.emit('edit');
    this.visible = true;

    if (sortie) {
      // Si une sortie est fournie, on la copie dans temp
      this.temp = {
        ...sortie,
        extendedProps: { ...sortie.extendedProps },
      };
    } else {
      // Sinon, on initialise avec des valeurs par défaut
      this.temp = this.createEmptySortie();
    }
  }

  onSave() {
    this.save.emit(this.temp);
  }

  switchToEdit() {
    this.modeChange.emit('edit');
  }

  onDelete() {
    if (this.sortie) {
      this.delete.emit(this.sortie);
    }
  }

  onClose() {
    this.close.emit();
  }

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
