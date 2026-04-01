import { trigger, transition, style, animate } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ opacity: 0 }),
    animate('200ms ease-in-out', style({ opacity: 1 }))
  ])
]);