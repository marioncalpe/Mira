import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { Sortie } from '../../core/models/sortie.model';
import { StorageService } from '../../core/storage/storage.service';
import { Objectif } from '../../core/models/objectif.model';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    MenuComponent,
    MotivationBannerComponent,
    DecimalPipe,
    CommonModule,
  ],
})
export class HomeComponent implements OnInit {
  sorties: Sortie[] = [];
  recentesSorties: Sortie[] = [];

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    // 5 sorties les plus récentes pour l'historique
    this.sorties = this.storageService.getSorties();
    this.recentesSorties = [...this.sorties]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, 5);
  }
}
