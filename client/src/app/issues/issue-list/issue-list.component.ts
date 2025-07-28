import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Issue } from '../../models/issue';
import { IssueService } from '../../services/issue.service';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="level">
        <div class="level-left">
          <div class="level-item">
            <h1 class="title">Issues</h1>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item">
            <button class="button is-primary" (click)="navigateToCreate()">
              <span class="icon">
                <i class="fas fa-plus"></i>
              </span>
              <span>Create New Issue</span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="issues.length === 0" class="notification is-info">
        <p>No issues found. <a (click)="navigateToCreate()" class="has-text-weight-bold">Create your first issue</a></p>
      </div>

      <div class="columns is-multiline" *ngIf="issues.length > 0">
        <div class="column is-one-third" *ngFor="let issue of issues">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">{{ issue.title }}</p>
              <div class="card-header-icon">
                <span class="tag" [ngClass]="getPriorityClass(issue.priority)">
                  {{ issue.priority }}
                </span>
              </div>
            </div>
            <div class="card-content">
              <div class="content">
                <p>{{ issue.description }}</p>
                <div class="tags">
                  <span class="tag is-success">{{ issue.project }}</span>
                  <span class="tag" [ngClass]="getStatusClass(issue.status)">
                    {{ issue.status }}
                  </span>
                  <span class="tag is-info" *ngIf="issue.assignee">
                    {{ issue.assignee }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <a class="card-footer-item has-text-primary" (click)="edit(issue.id)">
                <span class="icon">
                  <i class="fas fa-edit"></i>
                </span>
                <span>Edit</span>
              </a>
              <a class="card-footer-item has-text-danger" (click)="confirmDelete(issue)">
                <span class="icon">
                  <i class="fas fa-trash"></i>
                </span>
                <span>Delete</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" [class.is-active]="showDeleteModal">
      <div class="modal-background" (click)="cancelDelete()"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Confirm Delete</p>
          <button class="delete" (click)="cancelDelete()"></button>
        </header>
        <section class="modal-card-body">
          <p>Are you sure you want to delete the issue "<strong>{{ issueToDelete?.title }}</strong>"?</p>
          <p class="has-text-grey">This action cannot be undone.</p>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" (click)="delete()" [class.is-loading]="isDeleting">
            Delete
          </button>
          <button class="button" (click)="cancelDelete()">Cancel</button>
        </footer>
      </div>
    </div>
  `,
})
export class IssueListComponent implements OnInit {
  issues: Issue[] = [];
  showDeleteModal = false;
  issueToDelete: Issue | null = null;
  isDeleting = false;

  constructor(private service: IssueService, private router: Router) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.service.getIssues().subscribe(data => this.issues = data);
  }

  navigateToCreate() {
    this.router.navigate(['/create']);
  }

  edit(id?: number) {
    this.router.navigate(['/edit', id]);
  }

  confirmDelete(issue: Issue) {
    this.issueToDelete = issue;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.issueToDelete = null;
    this.isDeleting = false;
  }

  delete() {
    if (this.issueToDelete?.id) {
      this.isDeleting = true;
      this.service.deleteIssue(this.issueToDelete.id).subscribe({
        next: () => {
          this.loadIssues();
          this.cancelDelete();
        },
        error: (error) => {
          this.isDeleting = false;
          console.error('Error deleting issue:', error);
        }
      });
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'is-danger';
      case 'medium': return 'is-warning';
      case 'low': return 'is-success';
      default: return 'is-light';
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'open': return 'is-info';
      case 'in progress': return 'is-warning';
      case 'closed': return 'is-success';
      default: return 'is-light';
    }
  }
}
