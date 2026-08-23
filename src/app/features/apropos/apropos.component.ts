import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeadComponent } from '../../shared/components/head/head.component';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
  selector: 'app-apropos',
  standalone: true,
  imports: [CommonModule, HeadComponent, MenuComponent],
  templateUrl: './apropos.component.html',
  styleUrls: ['./apropos.component.scss'],
})
export class AproposComponent {

  constructor(private router: Router) {}

  revoirOnboarding(): void {
    localStorage.removeItem('onboarding_done');
    this.router.navigate(['/onboarding']);
  }
}