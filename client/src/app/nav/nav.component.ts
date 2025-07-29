import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="navbar is-light" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item" routerLink="/">
          <strong>MiniJira</strong>
        </a>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" (click)="toggleMenu()">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div class="navbar-menu" [class.is-active]="isMenuActive">
        <div class="navbar-start">
          <a class="navbar-item" routerLink="/issues" routerLinkActive="is-active">
            Issues
          </a>

          <a class="navbar-item" routerLink="/kanban" routerLinkActive="is-active">
            Kanban Board
          </a>

          <a class="navbar-item" routerLink="/projects" routerLinkActive="is-active">
            Projects
          </a>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <div class="buttons">
              <a class="button is-primary" routerLink="/issues/create">
                <strong>New Issue</strong>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  isMenuActive = false;

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }
}