import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../../shared/components/menu/menu.component';
import { MotivationBannerComponent } from '../../shared/components/motivation-banner/motivation-banner.component';

@Component({
  selector: 'app-coherence',
  standalone: true,
  imports: [CommonModule, MenuComponent, MotivationBannerComponent],
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

  ngAfterViewInit(): void {
    const root = getComputedStyle(document.documentElement);
    const total = root.getPropertyValue('--coherence-total-duration').trim() || '0s';
    const totalSeconds = this.parseSeconds(total);
    const totalMs = totalSeconds * 1000;

    // update aria-valuenow periodically for accessibility and control fallback animations
    this.startTime = Date.now();
    this.updateAria(0);

    // leave CSS animation enabled; JS fallback will also update position if needed

    this.intervalId = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const clamped = Math.min(elapsed, totalMs);
      const pct = totalMs > 0 ? Math.round((clamped / totalMs) * 100) : 0;
      this.percent = pct;
      this.updateAria(pct);

      // update ball position as fallback (JS-driven)
      try {
        const ball = this.ballEl.nativeElement;
        const container = ball.parentElement as HTMLElement;
        const containerH = container.clientHeight;
        const ballH = ball.clientHeight;
        const maxBottom = Math.max(0, containerH - ballH);

        // per-cycle phase
        const iterations = Math.max(1, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--coherence-iterations') || '5'));
        const cycleMs = totalMs / iterations;
        const cycleElapsed = elapsed % cycleMs;
        const phase = cycleMs > 0 ? cycleElapsed / cycleMs : 0; // 0..1

        let y = 0; // 0..1
        if (phase < 0.5) {
          // rising from 0 -> 1
          y = phase / 0.5;
        } else {
          // falling from 1 -> 0
          y = 1 - (phase - 0.5) / 0.5;
        }

        const bottomPx = Math.round(y * maxBottom);
        ball.style.bottom = bottomPx + 'px';

        // update visible phase text (only Inspirez/Expirez)
        try {
          if (this.statusEl && this.statusEl.nativeElement) {
            const sEl = this.statusEl.nativeElement;
            const phaseText = phase < 0.5 ? 'Inspirez' : 'Expirez';
            sEl.textContent = phaseText;
          }
        } catch (e) {}
      } catch (e) {
        // ignore
      }

      if (clamped >= totalMs) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private parseSeconds(value: string): number {
    // accepts formats like "100s" or "0.5s" or "100ms"
    value = value.trim();
    if (value.endsWith('ms')) return parseFloat(value.replace('ms', '')) / 1000;
    if (value.endsWith('s')) return parseFloat(value.replace('s', ''));
    return parseFloat(value) || 0;
  }

  private updateAria(pct: number): void {
    if (this.progressEl && this.progressEl.nativeElement) {
      const el = this.progressEl.nativeElement;
      el.setAttribute('aria-valuenow', String(pct));
      // set CSS variable so ::after width updates even if CSS animation fails
      el.style.setProperty('--progress-percent', pct + '%');
    }
  }
}
