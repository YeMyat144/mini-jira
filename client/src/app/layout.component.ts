import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar is-dark" role="navigation">
      <div class="navbar-brand">
        <a class="navbar-item" routerLink="/">
          <strong>MiniJira</strong>
        </a>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <a class="navbar-item" routerLink="/">
            <span class="icon">
              <i class="fas fa-home"></i>
            </span>
            <span>Issues</span>
          </a>
          <a class="navbar-item" routerLink="/create">
            <span class="icon">
              <i class="fas fa-plus"></i>
            </span>
            <span>New Issue</span>
          </a>
        </div>
      </div>
    </nav>
    <main class="section">
      <router-outlet />
    </main>
  `,
})
export class LayoutComponent {}
