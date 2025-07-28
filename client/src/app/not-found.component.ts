import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="hero is-fullheight-with-navbar">
        <div class="hero-body">
          <div class="container has-text-centered">
            <h1 class="title is-1">404</h1>
            <h2 class="subtitle">Page Not Found</h2>
            <p class="mb-5">The page you are looking for doesn't exist.</p>
            <a class="button is-primary" routerLink="/">
              <span class="icon">
                <i class="fas fa-home"></i>
              </span>
              <span>Go Home</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
