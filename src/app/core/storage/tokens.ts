import { InjectionToken } from '@angular/core';
import { SortieStorageService } from './sortie-storage.service';

export const SORTIE_STORAGE = new InjectionToken<SortieStorageService>('SORTIE_STORAGE');