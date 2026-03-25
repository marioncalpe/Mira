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
  @ViewChild('progress') progressEl!: ElementRef<HTMLElement>;
  @ViewChild('ball') ballEl!: ElementRef<HTMLElement>;
  @ViewChild('statusText') statusEl!: ElementRef<HTMLElement>;

  private intervalId: any = null;
  private startTime = 0;
  percent = 0;

  // Exercise state
  isRunning = false;
  isFinished = false;
  currentCycle = 1;
  totalCycles = 6;
  currentPhase: 'inspiration' | 'expiration' | 'finished' = 'inspiration';
  buttonLabel = 'Démarrer';

  private totalMs = 0;

  ngAfterViewInit(): void {
    // Set CSS variables for animation timing
    const root = document.documentElement;
    root.style.setProperty('--coherence-cycle-duration', '10s'); // 5s up + 5s down
    root.style.setProperty('--coherence-total-duration', '60s'); // 10s × 6 cycles
    root.style.setProperty('--coherence-iterations', '6');

    const total = root.style.getPropertyValue('--coherence-total-duration').trim() || '60s';
    const totalSeconds = this.parseSeconds(total);
    this.totalMs = totalSeconds * 1000;

    // Initialize without starting animation
    this.updateAria(0);
    this.pauseAnimation();
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startExercise(): void {
    if (this.isFinished) return; // Don't allow restart
    
    this.isRunning = true;
    this.buttonLabel = 'Pause';
    this.startTime = Date.now();
    this.playAnimation();
    this.startUpdateLoop();
  }

  togglePlayPause(): void {
    if (this.isFinished) return; // Don't allow toggle if finished
    
    if (this.isRunning) {
      this.isRunning = false;
      this.buttonLabel = 'Reprendre';
      this.pauseAnimation();
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    } else {
      this.isRunning = true;
      this.buttonLabel = 'Pause';
      this.playAnimation();
      this.startTime = Date.now() - (this.percent / 100) * this.totalMs; // Resume from current progress
      this.startUpdateLoop();
    }
  }

  private playAnimation(): void {
    const ball = this.ballEl?.nativeElement;
    const progress = this.progressEl?.nativeElement;
    if (ball) ball.style.animationPlayState = 'running';
    if (progress) progress.style.animationPlayState = 'running';
  }

  private pauseAnimation(): void {
    const ball = this.ballEl?.nativeElement;
    const progress = this.progressEl?.nativeElement;
    if (ball) ball.style.animationPlayState = 'paused';
    if (progress) progress.style.animationPlayState = 'paused';
  }

  private startUpdateLoop(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;

      const elapsed = Date.now() - this.startTime;
      const clamped = Math.min(elapsed, this.totalMs);
      const pct = this.totalMs > 0 ? Math.round((clamped / this.totalMs) * 100) : 0;
      this.percent = pct;
      this.updateAria(pct);

      // Update ball position as fallback (JS-driven)
      try {
        const ball = this.ballEl.nativeElement;
        const container = ball.parentElement as HTMLElement;
        const containerH = container.clientHeight;
        const ballH = ball.clientHeight;
        const maxBottom = Math.max(0, containerH - ballH);

        // Per-cycle phase calculation
        const cycleMs = this.totalMs / this.totalCycles;
        const cycleElapsed = elapsed % cycleMs;
        const phase = cycleMs > 0 ? cycleElapsed / cycleMs : 0; // 0..1

        // Calculate ball Y position
        let y = 0; // 0..1
        if (phase < 0.5) {
          y = phase / 0.5; // rising
        } else {
          y = 1 - (phase - 0.5) / 0.5; // falling
        }

        const bottomPx = Math.round(y * maxBottom);
        ball.style.bottom = bottomPx + 'px';

        // Update phase and cycle counter
        this.updatePhaseAndCycle(elapsed, phase);
      } catch {
        // ignore JS fallback errors
      }

      // Check if exercise is finished
      if (clamped >= this.totalMs) {
        this.finishExercise();
      }
    }, 100);
  }

  private updatePhaseAndCycle(elapsed: number, phase: number): void {
    const cycleMs = this.totalMs / this.totalCycles;
    const cycleNumber = Math.floor(elapsed / cycleMs) + 1;
    this.currentCycle = Math.min(cycleNumber, this.totalCycles);

    if (phase < 0.5) {
      this.currentPhase = 'inspiration';
    } else {
      this.currentPhase = 'expiration';
    }

    // Update status text with cycle info
    if (this.statusEl?.nativeElement) {
      const phaseLabel = this.currentPhase === 'inspiration' ? 'Inspiration' : 'Expiration';
      this.statusEl.nativeElement.textContent = `${phaseLabel} - Cycle ${this.currentCycle}/${this.totalCycles}`;
    }
  }

  private finishExercise(): void {
    this.isRunning = false;
    this.isFinished = true;
    this.currentPhase = 'finished';
    this.buttonLabel = 'Fini';
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.pauseAnimation();

    // Update status text
    if (this.statusEl?.nativeElement) {
      this.statusEl.nativeElement.textContent = 'Fini';
    }
  }

  private parseSeconds(value: string): number {
    // accepts formats like "100s" or "0.5s" or "100ms"
    value = value.trim();
    if (value.endsWith('ms')) return Number.parseFloat(value.replace('ms', '')) / 1000;
    if (value.endsWith('s')) return Number.parseFloat(value.replace('s', ''));
    return Number.parseFloat(value) || 0;
  }

  private updateAria(pct: number): void {
    if (this.progressEl?.nativeElement) {
      const el = this.progressEl.nativeElement;
      el.setAttribute('aria-valuenow', String(pct));
      // set CSS variable so ::after width updates even if CSS animation fails
      el.style.setProperty('--progress-percent', pct + '%');
    }
  }
}
