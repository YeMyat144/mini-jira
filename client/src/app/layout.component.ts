import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <nav>
      <a routerLink="/">Home</a> |
      <a routerLink="/create">New Issue</a>
    </nav>
    <router-outlet />
  `,
})
export class LayoutComponent {}
