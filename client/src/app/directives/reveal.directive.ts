import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GsapService, RevealOptions } from '../services/gsap.service';

@Directive({
  selector: '[appReveal]',
  standalone: true
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input('appReveal') revealOptions?: RevealOptions;

  private intersectionObserver?: IntersectionObserver;

  constructor(private elementRef: ElementRef<HTMLElement>, private gsapService: GsapService) {}

  ngOnInit(): void {
    const element = this.elementRef.nativeElement;
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.gsapService.animateReveal(element, this.revealOptions);
            this.intersectionObserver?.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    this.intersectionObserver.observe(element);
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }
}

