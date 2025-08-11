import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { GsapService } from '../services/gsap.service';

@Directive({
  selector: '[appNeonHover]',
  standalone: true,
})
export class NeonHoverDirective {
  @Input() appNeonHover?: string; // accent color

  constructor(private elementRef: ElementRef<HTMLElement>, private gsapService: GsapService) {}

  @HostListener('mouseenter') onEnter() {
    this.gsapService.hoverGlowIn(this.elementRef.nativeElement, this.appNeonHover);
  }

  @HostListener('mouseleave') onLeave() {
    this.gsapService.hoverGlowOut(this.elementRef.nativeElement);
  }
}

