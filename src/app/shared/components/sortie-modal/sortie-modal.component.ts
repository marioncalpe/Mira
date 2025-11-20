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
    title: '',
    start: '',
    extendedProps: {},
  };

  ngOnChanges() {
    this.temp = this.sortie
      ? { ...this.sortie }
      : { title: '', start: '', extendedProps: {} };
  }

  openCreate() {
    this.mode = 'edit';
    this.visible = true;

    this.temp = this.sortie
      ? { ...this.sortie }
      : { title: '', start: '', extendedProps: {} };
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
