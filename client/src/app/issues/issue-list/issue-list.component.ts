import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { Issue } from '../../models/issue';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { UserService } from '../../services/user.service';
import { IssueTypeService } from '../../services/issue-type.service';
import { IssueStatusService } from '../../services/issue-status.service';
import { Project } from '../../models/project';
import { User } from '../../models/user';
import { IssueType } from '../../models/issue-type';
import { IssueStatus } from '../../models/issue-status';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
            <div class="buttons">
              <a class="button is-info" routerLink="/kanban">
                <span class="icon">
                  <i class="fas fa-columns"></i>
                </span>
                <span>Kanban Board</span>
              </a>
              <a class="button is-primary" routerLink="/issues/create">
                <span class="icon">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Create New Issue</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="box mb-5">
        <div class="columns">
          <div class="column">
            <div class="field">
              <label class="label">Project</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select [(ngModel)]="filters.projectId" (change)="applyFilters()">
                    <option [value]="null">All Projects</option>
                    <option *ngFor="let project of projects" [value]="project.id">{{ project.name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Assignee</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select [(ngModel)]="filters.assigneeId" (change)="applyFilters()">
                    <option [value]="null">All Assignees</option>
                    <option [value]="-1">Unassigned</option>
                    <option *ngFor="let user of users" [value]="user.id">{{ user.displayName || user.username }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Issue Type</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select [(ngModel)]="filters.issueTypeId" (change)="applyFilters()">
                    <option [value]="null">All Types</option>
                    <option *ngFor="let type of issueTypes" [value]="type.id">{{ type.name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Status</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select [(ngModel)]="filters.issueStatusId" (change)="applyFilters()">
                    <option [value]="null">All Statuses</option>
                    <option *ngFor="let status of issueStatuses" [value]="status.id">{{ status.name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-grouped is-grouped-right">
          <div class="control">
            <button class="button is-light" (click)="resetFilters()">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Loading and Error States -->
      <div *ngIf="isLoading" class="has-text-centered my-5">
        <p class="is-size-5">Loading issues...</p>
      </div>

      <div *ngIf="errorMessage" class="notification is-danger">
        {{ errorMessage }}
      </div>

      <!-- No Issues State -->
      <div *ngIf="!isLoading && !errorMessage && issues.length === 0" class="notification is-info">
        <p>No issues found. <a routerLink="/issues/create" class="has-text-weight-bold">Create your first issue</a></p>
      </div>

      <!-- Issues List -->
      <div class="columns is-multiline" *ngIf="!isLoading && issues.length > 0">
        <div class="column is-one-third" *ngFor="let issue of issues">
          <div class="card">
            <div class="card-header">
              <p class="card-header-title">
                <span *ngIf="issue.issueType" class="icon mr-2" [title]="issue.issueType.name">
                  <i [class]="getIssueTypeIcon(issue.issueType)"></i>
                </span>
                {{ issue.title }}
              </p>
              <div class="card-header-icon">
                <span class="tag" [ngClass]="getPriorityClass(issue.priority)">
                  {{ issue.priority }}
                </span>
              </div>
            </div>
            <div class="card-content">
              <div class="content">
                <p class="issue-key mb-2">{{ issue.project?.key }}-{{ issue.id }}</p>
                <p>{{ issue.description ? (issue.description | slice:0:150) + (issue.description.length > 150 ? '...' : '') : '' }}</p>
                <div class="tags">
                  <span class="tag is-success" *ngIf="issue.project">
                    {{ issue.project.name }}
                  </span>
                  <span class="tag" *ngIf="issue.issueStatus" [ngClass]="getStatusClass(issue.issueStatus.name)">
                    {{ issue.issueStatus.name }}
                  </span>
                  <span class="tag is-info" *ngIf="issue.assignee">
                    {{ issue.assignee.displayName || issue.assignee.username }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <a class="card-footer-item has-text-info" [routerLink]="['/issues', issue.id]">
                <span class="icon">
                  <i class="fas fa-eye"></i>
                </span>
                <span>View</span>
              </a>
              <a class="card-footer-item has-text-primary" [routerLink]="['/issues', issue.id, 'edit']">
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
  projects: Project[] = [];
  users: User[] = [];
  issueTypes: IssueType[] = [];
  issueStatuses: IssueStatus[] = [];
  
  showDeleteModal = false;
  issueToDelete: Issue | null = null;
  isDeleting = false;
  isLoading = true;
  errorMessage = '';

  filters = {
    projectId: null as number | null,
    assigneeId: null as number | null,
    issueTypeId: null as number | null,
    issueStatusId: null as number | null
  };

  constructor(
    private issueService: IssueService,
    private projectService: ProjectService,
    private userService: UserService,
    private issueTypeService: IssueTypeService,
    private issueStatusService: IssueStatusService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilterData();
  }

  loadFilterData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Load all required data for filters
    forkJoin({
      projects: this.projectService.getProjects(),
      users: this.userService.getUsers(),
      issueTypes: this.issueTypeService.getIssueTypes(),
      issueStatuses: this.issueStatusService.getIssueStatuses()
    }).subscribe({
      next: (result) => {
        this.projects = result.projects;
        this.users = result.users;
        this.issueTypes = result.issueTypes;
        this.issueStatuses = result.issueStatuses;
        this.loadIssues();
      },
      error: (error) => {
        this.errorMessage = 'Failed to load filter data. Please try again.';
        console.error('Error loading filter data:', error);
        this.isLoading = false;
      }
    });
  }

  loadIssues(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.issueService.getIssues(
      this.filters.projectId === null ? undefined : this.filters.projectId,
      this.filters.assigneeId === -1 ? undefined : (this.filters.assigneeId === null ? undefined : this.filters.assigneeId),
      this.filters.issueTypeId === null ? undefined : this.filters.issueTypeId,
      this.filters.issueStatusId === null ? undefined : this.filters.issueStatusId
    ).subscribe({
      next: (data) => {
        this.issues = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load issues. Please try again.';
        console.error('Error loading issues:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadIssues();
  }

  resetFilters(): void {
    this.filters = {
      projectId: null,
      assigneeId: null,
      issueTypeId: null,
      issueStatusId: null
    };
    this.loadIssues();
  }

  confirmDelete(issue: Issue): void {
    this.issueToDelete = issue;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.issueToDelete = null;
    this.isDeleting = false;
  }

  delete(): void {
    if (this.issueToDelete?.id) {
      this.isDeleting = true;
      this.issueService.deleteIssue(this.issueToDelete.id).subscribe({
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

  getIssueTypeIcon(issueType: IssueType): string {
    if (!issueType || !issueType.icon) return 'fas fa-tasks';
    return issueType.icon;
  }

  getPriorityClass(priority: string): string {
    if (!priority) return 'is-light';
    
    switch (priority.toLowerCase()) {
      case 'high': return 'is-danger';
      case 'medium': return 'is-warning';
      case 'low': return 'is-success';
      default: return 'is-light';
    }
  }

  getStatusClass(status: string): string {
    if (!status) return 'is-light';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('to do') || statusLower.includes('open') || statusLower.includes('new')) {
      return 'is-info';
    } else if (statusLower.includes('in progress') || statusLower.includes('doing')) {
      return 'is-warning';
    } else if (statusLower.includes('done') || statusLower.includes('closed') || statusLower.includes('complete')) {
      return 'is-success';
    } else {
      return 'is-light';
    }
  }
}
