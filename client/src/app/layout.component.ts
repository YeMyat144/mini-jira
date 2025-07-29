import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <app-nav></app-nav>
    <main class="section">
      <router-outlet />
    </main>
  `,
  styles: [`
    .section {
      padding: 1.5rem;
    }
  `]
})
export class LayoutComponent {}
