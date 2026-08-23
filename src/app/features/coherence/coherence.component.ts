import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';
import { HeadComponent } from "../../shared/components/head/head.component";

@Component({
  selector: 'app-coherence',
  standalone: true,
  imports: [CommonModule, MenuComponent, MotivationBannerComponent, HeadComponent],
  templateUrl: './coherence.component.html',
  styleUrls: ['./coherence.component.scss'],
})
export class CoherenceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('ball') ballEl!: ElementRef<HTMLElement>;
  @ViewChild('statusText') statusEl!: ElementRef<HTMLElement>;

  // ← nouvelle variable pour basculer entre les deux vues
  vueActuelle: 'conseils' | 'exercice' = 'conseils';

  private intervalId: any = null;
  private startTime = 0;
  private pausedElapsed = 0;
  percent = 0;

  isRunning = false;
  isFinished = false;
  currentCycle = 1;
  totalCycles = 6;
  currentPhase: 'inspiration' | 'expiration' | 'finished' = 'inspiration';

  private totalMs = 0;

  modes = {
    classique: { inhale: 5, exhale: 5 },
    relaxant:  { inhale: 4, exhale: 6 },
    tonifiant: { inhale: 4, exhale: 4 },
  };
  selectedMode: keyof typeof this.modes = 'classique';

  ngAfterViewInit(): void {
    const root = document.documentElement;
    root.style.setProperty('--coherence-iterations', String(this.totalCycles));
    this.applyModeSettings(this.selectedMode);
    this.updateDots(0);
    this.pauseAnimation();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.retirerNoScroll();
  }

  /*================================*/
  /*      NAVIGATION DES VUES       */
  /*================================*/

  // Ouvre l'exercice de respiration en plein écran
  ouvrirExercice(): void {
    this.vueActuelle = 'exercice';
    this.appliquerNoScroll();
  }

  // Revient à la liste des conseils
  retourConseils(): void {
    // Si l'exercice est en cours, on l'arrête proprement
    if (this.isRunning) {
      this.togglePlayPause();
    }
    this.vueActuelle = 'conseils';
    this.retirerNoScroll();
  }

  private appliquerNoScroll(): void {
    try {
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
    } catch {}
  }

  private retirerNoScroll(): void {
    try {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    } catch {}
  }

  /*================================*/
  /*         EXERCICE (inchangé)    */
  /*================================*/

  onModeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const mode = (select.value || 'classique') as keyof typeof this.modes;
    this.selectedMode = mode;
    this.applyModeSettings(mode);
    if (this.isRunning) {
      this.startTime = Date.now() - this.pausedElapsed;
      this.playAnimation();
    }
  }

  private applyModeSettings(modeKey: keyof typeof this.modes): void {
    const root = document.documentElement;
    const mode = this.modes[modeKey];
    const cycleSec = mode.inhale + mode.exhale;
    root.style.setProperty('--coherence-cycle-duration', `${cycleSec}s`);
    const totalSec = cycleSec * this.totalCycles;
    root.style.setProperty('--coherence-total-duration', `${totalSec}s`);
    this.totalMs = totalSec * 1000;
  }

  startExercise(): void {
    if (this.isFinished) {
      this.isFinished = false;
      this.percent = 0;
      this.currentCycle = 1;
      this.pausedElapsed = 0;
      this.updateDots(0);
    }

    this.isRunning = true;
    this.startTime = Date.now() - this.pausedElapsed;
    this.playAnimation();
    this.startUpdateLoop();
  }

  togglePlayPause(): void {
    if (this.isFinished) return;

    if (this.isRunning) {
      this.pausedElapsed = Date.now() - this.startTime;
      this.isRunning = false;
      this.pauseAnimation();
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    } else {
      this.isRunning = true;
      this.startTime = Date.now() - this.pausedElapsed;
      this.playAnimation();
      this.startUpdateLoop();
    }
  }

  private playAnimation(): void {
    const ball = this.ballEl?.nativeElement;
    if (ball) ball.style.animationPlayState = 'running';
  }

  private pauseAnimation(): void {
    const ball = this.ballEl?.nativeElement;
    if (ball) ball.style.animationPlayState = 'paused';
  }

  private startUpdateLoop(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;

      const elapsed = Date.now() - this.startTime;
      const clamped = Math.min(elapsed, this.totalMs);
      const pct = this.totalMs > 0 ? Math.round((clamped / this.totalMs) * 100) : 0;
      this.percent = pct;
      this.updateDots(pct);

      try {
        const ball = this.ballEl.nativeElement;
        const cycleMs = this.totalMs / this.totalCycles;
        const cycleElapsed = elapsed % cycleMs;
        const phase = cycleMs > 0 ? cycleElapsed / cycleMs : 0;

        let y = phase < 0.5 ? phase / 0.5 : 1 - (phase - 0.5) / 0.5;
        const maxScale = 1.5;
        const scale = 1 + y * (maxScale - 1);
        ball.style.transform = `translateX(-50%) scale(${scale})`;

        this.updatePhaseAndCycle(elapsed, phase);
      } catch {}

      if (clamped >= this.totalMs) {
        this.finishExercise();
      }
    }, 100);
  }

  private updatePhaseAndCycle(elapsed: number, phase: number): void {
    const cycleMs = this.totalMs / this.totalCycles;
    const cycleNumber = Math.floor(elapsed / cycleMs) + 1;
    this.currentCycle = Math.min(cycleNumber, this.totalCycles);
    this.currentPhase = phase < 0.5 ? 'inspiration' : 'expiration';

    if (this.statusEl?.nativeElement) {
      this.statusEl.nativeElement.textContent =
        this.currentPhase === 'inspiration' ? 'Inspiration' : 'Expiration';
    }
  }

  private finishExercise(): void {
    this.isRunning = false;
    this.isFinished = true;
    this.currentPhase = 'finished';
    this.pausedElapsed = 0;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.pauseAnimation();

    if (this.statusEl?.nativeElement) {
      this.statusEl.nativeElement.textContent = 'Terminé ✓';
    }
  }

  get cycles(): any[] {
    return new Array(this.totalCycles);
  }

  private updateDots(pct: number): void {
    try {
      const completed = Math.floor((pct / 100) * this.totalCycles);
      const nodes = document.querySelectorAll('.dots .dot');
      nodes.forEach((el, idx) => {
        idx < completed
          ? el.classList.add('filled')
          : el.classList.remove('filled');
      });
    } catch {}
  }
}