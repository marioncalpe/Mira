import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-apropos',
  standalone: true,
  imports: [CommonModule],
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