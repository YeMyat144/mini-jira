import { Injectable } from '@angular/core';
import { gsap } from 'gsap';

export interface RevealOptions {
  y?: number;
  x?: number;
  startOpacity?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  ease?: string;
}

@Injectable({ providedIn: 'root' })
export class GsapService {
  /** Animate an element entering the viewport */
  animateReveal(element: Element, options: RevealOptions = {}): void {
    const {
      y = 24,
      x = 0,
      startOpacity = 0,
      scale = 0.98,
      duration = 0.8,
      delay = 0,
      ease = 'power3.out',
    } = options;

    gsap.fromTo(
      element,
      { opacity: startOpacity, y, x, scale },
      { opacity: 1, y: 0, x: 0, scale: 1, duration, delay, ease }
    );
  }

  /** Add a subtle neon hover glow */
  hoverGlowIn(element: Element, accentColor: string = 'rgba(0, 255, 204, 0.6)'): void {
    gsap.to(element, {
      duration: 0.25,
      y: -2,
      scale: 1.02,
      boxShadow: `0 0 0.5rem ${accentColor}, 0 0 1.25rem ${accentColor}`,
      filter: 'brightness(1.1)',
      ease: 'power2.out',
    });
  }

  hoverGlowOut(element: Element): void {
    gsap.to(element, {
      duration: 0.25,
      y: 0,
      scale: 1,
      boxShadow: 'none',
      filter: 'brightness(1)',
      ease: 'power2.out',
    });
  }
}

