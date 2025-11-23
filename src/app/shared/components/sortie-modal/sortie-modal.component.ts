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

  temp: Sortie = {
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

  ngOnChanges() {
    this.temp = this.sortie
      ? { ...this.sortie }
      : { title: '', start: '', extendedProps: {} };
  }

  openCreate(sortie?: Sortie) {
    this.mode = 'edit';
    this.visible = true;

    if (sortie) {
    // Si une sortie est fournie, on la copie dans temp
    this.temp = { ...sortie };
  } else {
    // Sinon, on initialise avec des valeurs par défaut
    this.temp = {
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

  onSave() {
    this.save.emit(this.temp);
  }

  switchToEdit() {
    this.mode = 'edit';
  }

  onDelete() {
    if (this.sortie) {
      this.delete.emit(this.sortie);
    }
  }

  onClose() {
    this.close.emit();
  }
}
